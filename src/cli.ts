import { Command } from 'commander';
import path from 'path';
import svelteTranspileTypescript from './svelteTranspileTypescript';

const exec = async (): Promise<void> => {
  const packageJson = require(path.join(__dirname, '../package.json'));

  const program = new Command();

  program
    .name(`svelte-transpile-typescript`)
    .version(packageJson.version, '-v --version', 'Version number')
    .helpOption('-h --help', 'For more information')
    .requiredOption('-i, --input <input>', 'input of application')
    .requiredOption('-o, --output <output>', 'output of declarations')
    .parse(process.argv);

  const options = program.opts();

  await svelteTranspileTypescript(options.input, options.output);
};

exec();
