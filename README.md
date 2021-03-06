# muse-json-generator

[![npm](https://img.shields.io/npm/v/muse-json-generator.svg?style=flat)](https://www.npmjs.com/package/muse-json-generator)
[![Build Status](https://travis-ci.org/moefront/muse-json-generator.svg?branch=master)](https://travis-ci.org/moefront/muse-json-generator)
[![Coverage Status](https://coveralls.io/repos/github/moefront/muse-json-generator/badge.svg?branch=master)](https://coveralls.io/github/moefront/muse-json-generator?branch=master)
![built by](https://img.shields.io/badge/built_by-MoeFront-ff69b4.svg)

Node.js JSON generator for the simple and diligent HTML5 audio player [MUSE](https://github.com/moefront/muse).


## Usage

### with Node.js API
```bash
$ npm install --save muse-json-generator
```

Create a new file named `playlist.js`

```js
const generator = require('muse-json-generator');
generator(477331181, 480097777).then(playlist => {
	console.log(playlist);
});
```

```bash
node playlist.js > playlist.json
```

### on CLI
```bash
$ npm install -g muse-json-generator
```

```bash
$ muse 477331181 480097777
$ muse 477331181,480097777

$ muse 477331181 480097777 --temporary 
# If you want a temporary link like /m([0-9]).music.126.net/, please provide this option.
```

This action would generate a `playlist.json` in your current working directory.

**Try `--stdout` option to write playlist to stdout without generating a file.**
```bash
$ muse 477331181 480097777 --stdout
```

## API

```js
const generator = require('muse-json-generator');
```
### generator(id, [id], [id], ...)

**Returns Promise<string>.**


## Todo list

 - [x] Adjust translation
 - [x] test


## License

&copy; 2017-2020 MoeFront Studio | The MIT License (MIT).
