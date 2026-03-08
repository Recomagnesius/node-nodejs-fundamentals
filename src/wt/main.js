import fs from 'node:fs/promises';
import { cpus } from 'node:os';
import { Worker } from 'node:worker_threads';

const mergeSortedChunks = (chunks) => {
  const indices = new Array(chunks.length).fill(0);
  const result = [];

  while (true) {
    let minChunkIndex = -1;
    let minValue = Infinity;

    for (let i = 0; i < chunks.length; i += 1) {
      const currentIndex = indices[i];

      if (currentIndex < chunks[i].length) {
        const value = chunks[i][currentIndex];

        if (value < minValue) {
          minValue = value;
          minChunkIndex = i;
        }
      }
    }

    if (minChunkIndex === -1) {
      break;
    }

    result.push(minValue);
    indices[minChunkIndex] += 1;
  }

  return result;
};

const main = async () => {
  const dataPath = new URL('./data.json', import.meta.url);
  const raw = await fs.readFile(dataPath, 'utf8');
  const numbers = JSON.parse(raw);

  const cpuCount = cpus().length;
  const workerCount = Math.min(cpuCount, numbers.length || 1);
  const chunkSize = Math.ceil(numbers.length / workerCount);

  const chunks = [];

  for (let i = 0; i < workerCount; i += 1) {
    const start = i * chunkSize;
    const end = start + chunkSize;
    chunks.push(numbers.slice(start, end));
  }

  const workerPath = new URL('./worker.js', import.meta.url);

  const sortedChunks = await Promise.all(
    chunks.map(
      (chunk) =>
        new Promise((resolve, reject) => {
          const worker = new Worker(workerPath, {
            type: 'module',
          });

          worker.once('message', (sortedChunk) => {
            resolve(sortedChunk);
          });

          worker.once('error', reject);

          worker.once('exit', (code) => {
            if (code !== 0) {
              reject(new Error(`Worker stopped with exit code ${code}`));
            }
          });

          worker.postMessage(chunk);
        }),
    ),
  );

  const merged = mergeSortedChunks(sortedChunks);
  console.log(merged);
};

await main();