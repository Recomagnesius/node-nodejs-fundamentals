import fs from 'node:fs';
import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { createBrotliCompress } from 'node:zlib';

const compressDir = async () => {
  const workspaceUrl = new URL('./workspace/', import.meta.url);
  const sourceUrl = new URL('./workspace/toCompress/', import.meta.url);
  const compressedDirUrl = new URL('./workspace/compressed/', import.meta.url);
  const archiveUrl = new URL('./workspace/compressed/archive.br', import.meta.url);

  try {
    await access(sourceUrl);
  } catch {
    throw new Error('FS operation failed');
  }

  const entries = [];

  const walk = async (dirUrl, relativePath = '') => {
    const dirEntries = await readdir(dirUrl, { withFileTypes: true });

    for (const entry of dirEntries) {
      const entryRelativePath = relativePath
        ? `${relativePath}/${entry.name}`
        : entry.name;

      const entryUrl = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, dirUrl);

      if (entry.isDirectory()) {
        entries.push({
          path: entryRelativePath,
          type: 'directory',
        });

        await walk(entryUrl, entryRelativePath);
      } else if (entry.isFile()) {
        const content = await readFile(entryUrl);

        entries.push({
          path: entryRelativePath,
          type: 'file',
          content: content.toString('base64'),
        });
      }
    }
  };

  await walk(sourceUrl);

  await mkdir(compressedDirUrl, { recursive: true });

  const payload = JSON.stringify({
    rootPath: sourceUrl.pathname,
    entries,
  });

  const tempJsonUrl = new URL('./workspace/compressed/__temp_archive_source__.json', import.meta.url);

  await writeFile(tempJsonUrl, payload, 'utf8');

  try {
    await pipeline(
      fs.createReadStream(tempJsonUrl),
      createBrotliCompress(),
      fs.createWriteStream(archiveUrl),
    );
  } finally {
    await fs.promises.unlink(tempJsonUrl).catch(() => {});
  }
};

await compressDir();