import { Transform } from 'node:stream';

const filter = () => {
  const args = process.argv.slice(2);
  const patternIndex = args.indexOf('--pattern');
  const pattern = patternIndex !== -1 ? args[patternIndex + 1] ?? '' : '';

  let leftover = '';

  const filterStream = new Transform({
    transform(chunk, encoding, callback) {
      const data = leftover + chunk.toString();
      const lines = data.split('\n');
      leftover = lines.pop();

      const matched = lines
        .filter((line) => line.includes(pattern))
        .map((line) => `${line}\n`)
        .join('');

      callback(null, matched);
    },

    flush(callback) {
      if (leftover.includes(pattern)) {
        callback(null, leftover);
        return;
      }

      callback(null, '');
    },
  });

  process.stdin.pipe(filterStream).pipe(process.stdout);
};

filter();