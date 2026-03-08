const progress = () => {
  const args = process.argv.slice(2);

  const getArgValue = (name) => {
    const index = args.indexOf(name);
    return index !== -1 ? args[index + 1] : undefined;
  };

  const duration = Number(getArgValue('--duration')) || 5000;
  const interval = Number(getArgValue('--interval')) || 100;
  const length = Number(getArgValue('--length')) || 30;
  const color = getArgValue('--color');

  const isValidHexColor = (value) => /^#[0-9A-Fa-f]{6}$/.test(value || '');

  const hexToRgb = (hex) => {
    const clean = hex.slice(1);
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    };
  };

  const colorize = (text, hex) => {
    if (!isValidHexColor(hex)) return text;

    const { r, g, b } = hexToRgb(hex);
    return `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`;
  };

  const totalSteps = Math.ceil(duration / interval);
  let currentStep = 0;

  const render = () => {
    const percent = Math.min(
      100,
      Math.round((currentStep / totalSteps) * 100),
    );

    const filledLength = Math.round((percent / 100) * length);
    const emptyLength = length - filledLength;

    const filled = '█'.repeat(filledLength);
    const empty = ' '.repeat(emptyLength);

    const coloredFilled = colorize(filled, color);
    process.stdout.write(`\r[${coloredFilled}${empty}] ${percent}%`);
  };

  render();

  const timer = setInterval(() => {
    currentStep += 1;
    render();

    if (currentStep >= totalSteps) {
      clearInterval(timer);
      process.stdout.write('\nDone!\n');
    }
  }, interval);
};

progress();