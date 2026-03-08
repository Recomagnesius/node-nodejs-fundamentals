import { Transform } from 'node:stream';

const lineNumberer = () => {
  let lineNumber = 1;
  let leftover = '';

  const numberStream = new Transform({
    transform(chunk, encoding, callback) {
      const data = leftover + chunk.toString();
      const lines = data.split('\n');
      leftover = lines.pop();

      const numbered = lines
        .map((line) => `${lineNumber++} | ${line}\n`)
        .join('');

      callback(null, numbered);
    },

    flush(callback) {
      if (leftover.length > 0) {
        callback(null, `${lineNumber} | ${leftover}`);
        return;
      }

      callback(null, '');
    },
  });

  process.stdin.pipe(numberStream).pipe(process.stdout);
};

lineNumberer();