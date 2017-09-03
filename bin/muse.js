#!/usr/bin/env node
/* eslint no-var: 0 */
/* eslint prefer-arrow-callback: 0 */
/* eslint strict: 0 */
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
  generator.options = {
    temporary: true
  };
}

if (argv.length === 0) {
  console.log([pkg.name, pkg.version].join(' '));
} else {
  if (argv.length === 1) {
    argv = argv[0].split(',');
  }

  generator
    .apply(this, argv)
    .then(function(playlist) {
      fs.writeFileSync('playlist.json', playlist);
      console.log('playlist.json generated successfully');
    })
    .catch(function(err) {
      console.log(pe.render(err));
    });
}
