import fs from 'node:fs/promises';
import path from 'node:path';

const merge = async () => {
 const workspacePath = path.resolve(process.cwd(), 'workspace');
  const partsPath = path.join(workspacePath, 'parts');
  const outputPath = path.join(workspacePath, 'merged.txt');

  try {
    await fs.access(partsPath);
  } catch {
    throw new Error('FS operation failed');
  }

  let filesToMerge = [];
  const filesArgIndex = process.argv.indexOf('--files');

  if (filesArgIndex !== -1 && process.argv[filesArgIndex + 1]) {
    filesToMerge = process.argv[filesArgIndex + 1]
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);

    if (filesToMerge.length === 0) {
      throw new Error('FS operation failed');
    }

    for (const fileName of filesToMerge) {
      const filePath = path.join(partsPath, fileName);

      try {
        await fs.access(filePath);
      } catch {
        throw new Error('FS operation failed');
      }
    }
  } else {
    const dirEntries = await fs.readdir(partsPath, { withFileTypes: true });

    filesToMerge = dirEntries
      .filter((entry) => entry.isFile() && path.extname(entry.name) === '.txt')
      .map((entry) => entry.name)
      .sort();

    if (filesToMerge.length === 0) {
      throw new Error('FS operation failed');
    }
  }

  let mergedContent = '';

  for (const fileName of filesToMerge) {
    const filePath = path.join(partsPath, fileName);
    const content = await fs.readFile(filePath, 'utf8');
    mergedContent += content;
  }

  await fs.writeFile(outputPath, mergedContent, 'utf8');
};

await merge();
