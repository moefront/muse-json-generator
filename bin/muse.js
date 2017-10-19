#!/usr/bin/env node
'use strict';
var fs = require('fs');
var PrettyError = require('pretty-error');
var generator = require('../lib/generator');
var pkg = require('../package.json');

var argv = process.argv.slice(2);
var pe = new PrettyError();

var temporaryIndex = argv.indexOf('--temporary');
if (temporaryIndex > -1) {
  argv.splice(temporaryIndex, 1);
}

var stdoutIndex = argv.indexOf('--stdout');
if (stdoutIndex > -1) {
  argv.splice(stdoutIndex, 1);
}

if (argv.length === 0) {
  console.log([pkg.name, pkg.version].join(' '));
  console.log('Usage: https://github.com/moefront/muse-json-generator');
} else {
  if (argv.length === 1) {
    argv = argv[0].split(',');
  }

  if (temporaryIndex > -1) {
    argv.push({ temporary: true });
  }

  generator
    .apply(this, argv)
    .then(function(playlist) {
      if (stdoutIndex === -1) {
        fs.writeFileSync('playlist.json', playlist);
        console.log('playlist.json generated successfully');
      } else {
        console.log(playlist);
      }
    })
    .catch(function(err) {
      console.log(pe.render(err));
    });
}
