import fs from 'node:fs';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { createBrotliDecompress } from 'node:zlib';

const decompressDir = async () => {
  const compressedDirUrl = new URL('./workspace/compressed/', import.meta.url);
  const archiveUrl = new URL('./workspace/compressed/archive.br', import.meta.url);
  const decompressedDirUrl = new URL('./workspace/decompressed/', import.meta.url);
  const tempJsonUrl = new URL('./workspace/compressed/__temp_archive_output__.json', import.meta.url);

  try {
    await access(compressedDirUrl);
    await access(archiveUrl);
  } catch {
    throw new Error('FS operation failed');
  }

  await mkdir(decompressedDirUrl, { recursive: true });

  await pipeline(
    fs.createReadStream(archiveUrl),
    createBrotliDecompress(),
    fs.createWriteStream(tempJsonUrl),
  );

  try {
    const raw = await fs.promises.readFile(tempJsonUrl, 'utf8');
    const archiveData = JSON.parse(raw);

    for (const entry of archiveData.entries) {
      const entryUrl = new URL(`./workspace/decompressed/${entry.path}`, import.meta.url);

      if (entry.type === 'directory') {
        await mkdir(entryUrl, { recursive: true });
      } else if (entry.type === 'file') {
        const lastSlashIndex = entry.path.lastIndexOf('/');

        if (lastSlashIndex !== -1) {
          const parentDir = entry.path.slice(0, lastSlashIndex);
          const parentUrl = new URL(`./workspace/decompressed/${parentDir}/`, import.meta.url);
          await mkdir(parentUrl, { recursive: true });
        }

        const content = Buffer.from(entry.content, 'base64');
        await writeFile(entryUrl, content);
      }
    }
  } finally {
    await fs.promises.unlink(tempJsonUrl).catch(() => {});
  }
};

await decompressDir();