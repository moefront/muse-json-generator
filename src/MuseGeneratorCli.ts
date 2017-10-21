import * as fs from 'fs';
import yargs from 'yargs';
import * as ora from 'ora';
import chalk from 'chalk';
import * as PrettyError from 'pretty-error';
import generator = require('./generator');
import * as pkg from 'pjson';

export = class MuseGeneratorCli {
  private pe: PrettyError;
  private spinner: any;

  public constructor() {
    this.pe = new PrettyError();
    this.spinner = ora('Fetching from Netease');
  }

  public start(): void {
    let input: Array<any> = [];

    const args = yargs(process.argv.slice(2))
      .describe('temporary', 'temporary mode')
      .describe('stdout', 'stdout mode')
      .alias('t', 'temporary')
      .alias('s', 'stdout').argv;

    if (args._.length === 0) {
      console.log(chalk.bold.green([pkg.name, pkg.version].join(' ')));
      console.log(`Usage: ${chalk.underline(pkg.homepage)}`);
    } else {
      if (args._.length === 1) {
        input = args._[0].toString().split(',');
      } else if (args._.length > 1) {
        input = args._;
      }

      if (args.temporary) {
        input.push({ temporary: true });
      }

      this.spinner.start();

      generator(...input)
        .then((playlist: string) => {
          this.spinner.stop();
          if (!args.stdout) {
            fs.writeFileSync('playlist.json', playlist);
            console.log(
              chalk.bold.green('playlist.json generated successfully')
            );
          } else {
            console.log(playlist);
          }
        })
        .catch((err: Error) => {
          this.spinner.stop();
          console.log(this.pe.render(err));
        });
    }
  }
};
