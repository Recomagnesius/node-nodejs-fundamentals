import { spawn } from 'node:child_process';

const execCommand = () => {
  const command = process.argv[2];

  if (!command) {
    process.exit(1);
  }

  const child = spawn(command, {
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe'],
    env: process.env,
  });

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });

  child.on('error', () => {
    process.exit(1);
  });
};

execCommand();