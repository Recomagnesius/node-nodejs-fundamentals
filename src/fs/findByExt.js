import fs from 'node:fs/promises';
import path from 'node:path';

const findByExt = async () => {
  const workspacePath = path.resolve(process.cwd(), 'workspace');
  try {
    await fs.access(workspacePath);
  } catch {
    throw new Error('FS operation failed');
  }

  let ext = 'txt';
  let extIndex = process.argv.indexOf(--ext);
  if(extIndex != -1 && process.argv[estIndex + 1]) ext = process.argv[estIndex + 1];
  if(!(ext.startsWith('.'))) ext = '.' + ext;
  let matches = [];
  await walkDir(workspacePath, '', matches, ext);
  matches.sort();
  for(let filePath of matches){
    console.log(filePath);
  }
};

await findByExt();

async function walkDir(rootDir, currentDir, matches, ext) {
  const currentAbsPath = path.resolve(rootDir, currentDir);
  const items = await fs.readdir(currentAbsPath, { withFileTypes: true });

  for (const item of items) {
    const relPath = path.join(currentDir, item.name);
    const absPath = path.resolve(rootDir, relPath);

    if (item.isDirectory()) {
      await walkDir(rootDir, relPath, matches, ext);
    } else if (item.isFile()) {
      if (path.extname(item.name) === ext) {
        matches.push(relPath);
      }
    }
  }
}