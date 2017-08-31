#!/usr/bin/env node
/* eslint no-var: 0 */
/* eslint prefer-arrow-callback: 0 */
var fs = require('fs');
var generator = require('../lib/generator');
var pkg = require('../package.json');

var argv = process.argv.slice(2);

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
      console.error(err);
    });
}
