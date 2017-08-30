# muse-json-generator

[![npm](https://img.shields.io/npm/v/muse-json-generator.svg?style=flat)](https://www.npmjs.com/package/muse-json-generator)
![built by](https://img.shields.io/badge/built_by-MoeFront-ff69b4.svg)

Node.js JSON generator for the simple and diligent HTML5 audio player [MUSE](https://github.com/moefront/muse).


## Installation

```bash
$ npm install --save muse-json-generator
```

## Usage
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

## API

```js
const generator = require('muse-json-generator');
```
### generator(id, [id], [id], ...)

**Returns Promise.**


## Todo list

 - [ ] Adjust translation


## License

&copy; 2017 MoeFront Studio | The MIT License (MIT).