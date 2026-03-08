import fs from 'node:fs';
import { access } from 'node:fs/promises';

const split = async () => {
  const args = process.argv.slice(2);
  const linesIndex = args.indexOf('--lines');
  const maxLines =
    linesIndex !== -1 && args[linesIndex + 1]
      ? Number(args[linesIndex + 1])
      : 10;

  const sourcePath = new URL('./source.txt', import.meta.url);

  try {
    await access(sourcePath);
  } catch {
    throw new Error('FS operation failed');
  }

  const readStream = fs.createReadStream(sourcePath, { encoding: 'utf8' });

  let leftover = '';
  let chunkNumber = 1;
  let currentLines = [];

  const writeChunk = async () => {
    if (currentLines.length === 0) return;

    const chunkPath = new URL(`./chunk_${chunkNumber}.txt`, import.meta.url);
    const content = currentLines.join('\n');

    await fs.promises.writeFile(chunkPath, content);

    chunkNumber += 1;
    currentLines = [];
  };

  for await (const chunk of readStream) {
    const data = leftover + chunk;
    const lines = data.split('\n');
    leftover = lines.pop();

    for (const line of lines) {
      currentLines.push(line);

      if (currentLines.length === maxLines) {
        await writeChunk();
      }
    }
  }

  if (leftover.length > 0) {
    currentLines.push(leftover);
  }

  await writeChunk();
};

await split();