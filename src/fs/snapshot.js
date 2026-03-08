import fs from 'node:fs/promises';
import path from 'node:path';

const snapshot = async () => {

  const workspacePath = path.resolve(process.cwd(), 'workspace');
  let entries = [];

try {
  await fs.access(workspacePath);
} catch {
  throw new Error('FS operation failed');
}

  await walkDir(workspacePath, "", entries);
  let result = {
    "rootPath": workspacePath,
    "entries": entries,
  };
  const snapshotPath = path.resolve(process.cwd(), 'snapshot.json');
  await fs.writeFile(snapshotPath, JSON.stringify(result, null, 2), 'utf-8');
  return result;
};

await snapshot();

async function walkDir(rootDir, currentDir, entries){
  const items = await fs.readdir( path.resolve(rootDir, currentDir), {withFileTypes: true});
  for (const item of items){
    const name = item.name;
    if (item.isDirectory()){
      let relPath = path.join(currentDir, name);
      let entry = {
        "path": relPath,
        "type": "directory"
      };
      entries.push(entry);
      await walkDir(rootDir, relPath, entries);
    }
    else if(item.isFile()){
      let absPath = path.resolve(rootDir, currentDir, name);
      let content = await getFileContents(absPath);
      let stats = await fs.stat(absPath);
      let entry = {
        "path": path.join(currentDir, name),
        "type": "file",
        "size": stats.size,
        "content": content,
      };
      entries.push(entry);
    }
  }
}

async function getFileContents(filePath){
  const data = await fs.readFile(filePath);
  const base64String = data.toString('base64');
  return base64String;
}