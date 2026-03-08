import fs from 'node:fs';
import { access, readFile } from 'node:fs/promises';
import crypto from 'node:crypto';

const verify = async () => {
  const checksumsPath = new URL('./checksums.json', import.meta.url);

  try {
    await access(checksumsPath);
  } catch {
    throw new Error('FS operation failed');
  }

  const raw = await readFile(checksumsPath, 'utf8');
  const checksums = JSON.parse(raw);

  const hashFile = (filePath) =>
    new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('data', (chunk) => {
        hash.update(chunk);
      });

      stream.on('end', () => {
        resolve(hash.digest('hex'));
      });

      stream.on('error', reject);
    });

  for (const [fileName, expectedHash] of Object.entries(checksums)) {
    const filePath = new URL(`./${fileName}`, import.meta.url);
    const actualHash = await hashFile(filePath);

    console.log(`${fileName} — ${actualHash === expectedHash ? 'OK' : 'FAIL'}`);
  }
};

await verify();