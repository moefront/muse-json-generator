#!/usr/bin/env node
'use strict';
var fs = require('fs');
var yargs = require('yargs');
var ora = require('ora');
var PrettyError = require('pretty-error');
var generator = require('../lib/generator');
var pkg = require('../package.json');

var pe = new PrettyError();
var input = [];

var args = yargs(process.argv.slice(2))
  .describe('temporary', 'temporary mode')
  .describe('stdout', 'stdout mode')
  .alias('t', 'temporary')
  .alias('s', 'stdout').argv;

if (args._.length === 0) {
  console.log([pkg.name, pkg.version].join(' '));
  console.log('Usage: ' + pkg.homepage);
} else {
  if (args._.length === 1) {
    input = args._[0].toString().split(',');
  } else if (args._.length > 1) {
    input = args._;
  }

  if (args.temporary) {
    input.push({ temporary: true });
  }

  var spinner = ora('Fetching from Netease');
  spinner.start();

  generator
    .apply(this, input)
    .then(function(playlist) {
      spinner.stop();
      if (!args.stdout) {
        fs.writeFileSync('playlist.json', playlist);
        console.log('playlist.json generated successfully');
      } else {
        console.log(playlist);
      }
    })
    .catch(function(err) {
      spinner.stop();
      console.log(pe.render(err));
    });
}
