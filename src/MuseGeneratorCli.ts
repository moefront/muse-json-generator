import * as fs from 'fs';
import * as program from 'commander';
import * as ora from 'ora';
import chalk from 'chalk';
import * as PrettyError from 'pretty-error';
import * as pkg from 'pjson';
import * as semver from 'semver';
import honoka from 'honoka';
import generator = require('./generator');
import Config from './Config';
import registerHonoka from './registerHonoka';

export = class MuseGeneratorCli {
  private pe: PrettyError;
  private spinners: any;

  public constructor() {
    registerHonoka();
    this.pe = new PrettyError();
    this.spinners = {
      update: ora('Checking for Updates'),
      fetching: ora('Fetching from Netease')
    };
  }

  public start(): void {
    let input: Array<any> = [];

    program
      .version(pkg.version)
      .option('-c, --check', 'check for updates')
      .option('-t, --temporary', 'temporary mode')
      .option('-s, --stdout', 'stdout mode')
      .parse(process.argv);

    if (program.check) {
      this.checkUpdate().catch(() => {
        this.spinners.update.stop();
      });
      return;
    }

    if (program.args.length === 0) {
      program.outputHelp();
    } else {
      if (program.args.length === 1) {
        input = program.args[0].toString().split(',');
      } else if (program.args.length > 1) {
        input = program.args;
      }

      if (program.temporary) {
        input.push({ temporary: true });
      }

      this.spinners.fetching.start();

      generator(...input)
        .then((playlist: string) => {
          this.spinners.fetching.stop();
          if (!program.stdout) {
            fs.writeFileSync('playlist.json', playlist);
            console.log(
              chalk.bold.green('playlist.json generated successfully')
            );
          } else {
            console.log(playlist);
          }
        })
        .catch((err: Error) => {
          this.spinners.fetching.stop();
          console.log(this.pe.render(err));
        });
    }
  }

  private async checkUpdate(): Promise<void> {
    this.spinners.update.start();
    let latestPkg: any = await honoka.get(Config.PackageURL);
    this.spinners.update.stop();
    latestPkg = JSON.parse(latestPkg);
    const latestVersion = latestPkg.version;
    const currentVersion = pkg.version;
    if (!semver.valid(latestVersion)) {
      return;
    }

    if (semver.gt(latestVersion, currentVersion)) {
      console.log(
        chalk.bold.red(
          `Your current version of ${pkg.name} is out of date. The latest version is ${latestVersion} while you're on ${currentVersion}.`
        )
      );
    } else {
      console.log(
        chalk.bold.green(`You're on latest version ${currentVersion}`)
      );
    }
  }
};
