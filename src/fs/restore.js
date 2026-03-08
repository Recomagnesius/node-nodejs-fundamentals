import fs from 'node:fs/promises';
import path from 'node:path';


const restore = async () => {
  const snapshotPath = path.resolve(process.cwd(), 'snapshot.json');
  const restoredPath = path.resolve(process.cwd(), 'workspace_restored');
  try{
    await fs.access(snapshotPath);
  }catch(error){
    throw new Error("FS operation failed");
  }
  try {
    await fs.access(restoredPath);
    throw new Error('FS operation failed');
  } catch (error) {
    if (error.message === 'FS operation failed') {
      throw error;
    }
  }
  const raw = await fs.readFile(snapshotPath, 'utf8');
  const snapshot = JSON.parse(raw);

  await fs.mkdir(restoredPath);

  for(const entry of snapshot.entries){
    const targetPath = path.join(restoredPath, entry.path);
    if(entry.type == 'directory'){
      await fs.mkdir(targetPath, {recursive: true});
    }
    else if(entry.type == 'file'){
      await fs.mkdir(path.dirname(targetPath), {recursive: true});
      const data = Buffer.from(entry.content, 'base64');
      await fs.writeFile(targetPath, data);
    }
  }
};

await restore();
