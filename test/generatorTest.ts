///<reference path="../node_modules/@types/node/index.d.ts"/>
///<reference path="../node_modules/@types/mocha/index.d.ts"/>
///<reference path="../node_modules/@types/power-assert/index.d.ts"/>
///<reference path="../node_modules/@types/nock/index.d.ts"/>

import * as assert from 'power-assert';
import * as cp from 'child_process';
import { URL } from 'url';
import * as path from 'path';
import honoka from 'honoka';
import * as nock from 'nock';
import generator = require('../src/generator');

const BIN_PATH = `node ${path.join(__dirname, '/../bin/muse.js')}`;
const ORIGINAL_REGEX = /music.126.net/;
const TEST_SONGS = [
  477331181, // normal
  480097777, // normal
  26214326, // multiple artists
  404, // not found
  1818227 // without lyric
];
const PLAYLIST_KEYS = [
  'title',
  'artist',
  'cover',
  'src',
  'lyric',
  'translation'
];

describe('generator function test', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('input a non-numberic value should throw error', async () => {
    let err: any;
    try {
      await generator('niconiconi');
    } catch (e) {
      err = e;
    }
    assert.throws(() => {
      throw err;
    }, /invalid song ID/);
  });

  it('input two song ID should output an array contained two objects', async () => {
    let playlist: any = await generator(TEST_SONGS[0], TEST_SONGS[1]);
    playlist = JSON.parse(playlist);
    assert.equal(true, Array.isArray(playlist));
    assert.equal(2, playlist.length);
  });

  it('output should contain specified keys', async () => {
    let playlist: any = await generator(TEST_SONGS[0]);
    playlist = JSON.parse(playlist);
    PLAYLIST_KEYS.forEach(key => {
      assert.equal(
        true,
        Object.prototype.hasOwnProperty.call(playlist[0], key)
      );
    });
  });

  it('artists should be divided with / when a song has more than one artist', async () => {
    let playlist: any = await generator(TEST_SONGS[2]);
    playlist = JSON.parse(playlist);
    assert.equal(
      true,
      String.prototype.indexOf.call(playlist[0].artist, '/') > -1
    );
  });

  it('src should contain temporary link when user apply temporary mode', async () => {
    let playlist: any = await generator(TEST_SONGS[0], {
      temporary: true
    });
    playlist = JSON.parse(playlist);
    const src = playlist[0].src;

    assert.equal(true, ORIGINAL_REGEX.test(src));

    const srcURL = new URL(src);

    if (ORIGINAL_REGEX.test(srcURL.host)) {
      await honoka.head(
        `https://api.kotori.love/netease/${srcURL.host}${srcURL.pathname}`
      );
      assert.equal(200, honoka.response.status);
      assert.equal('audio/mpeg', honoka.response.headers.get('Content-Type'));
    }
  });

  it('lyric should be undefined when a song has not lyric', async () => {
    let playlist: any = await generator(TEST_SONGS[4]);
    playlist = JSON.parse(playlist);
    assert.equal('undefined', typeof playlist[0].lyric);
  });

  it('should throw error when input is empty', async () => {
    let err: any;
    try {
      await generator();
    } catch (e) {
      err = e;
    }
    assert.throws(() => {
      throw err;
    }, /invalid input/);
  });

  it('should throw error when song is not found', async () => {
    let err: any;
    try {
      await generator(TEST_SONGS[3]);
    } catch (e) {
      err = e;
    }
    assert.throws(() => {
      throw err;
    }, `song ID ${TEST_SONGS[3]} is not exist`);
  });

  it('should throw error when response is not valid', async () => {
    nock(/(.*)/)
      .get(/(.*)/)
      .query(() => true)
      .reply(200, '{');

    let err: any;
    try {
      await generator(TEST_SONGS[0]);
    } catch (e) {
      err = e;
    }
    assert.throws(() => {
      throw err;
    }, /response is not a valid json string/);
  });

  it("should throw error when response's code is not 200", async () => {
    nock(/(.*)/)
      .get(/(.*)/)
      .query(() => true)
      .reply(200, '{"code":400}');

    let err: any;
    try {
      await generator(TEST_SONGS[0]);
    } catch (e) {
      err = e;
    }
    assert.throws(() => {
      throw err;
    }, /response code is not valid/);
  });
});

describe('generator cli test', () => {
  it('stdout mode should work', () => {
    let playlist: any = cp
      .execSync(`${BIN_PATH} ${TEST_SONGS[0]} --stdout`)
      .toString();
    playlist = JSON.parse(playlist);
    assert.equal(1, playlist.length);
  });

  it('stdout mode should work with two song ID', () => {
    let playlist: any = cp
      .execSync(`${BIN_PATH} ${TEST_SONGS[0]} ${TEST_SONGS[1]} --stdout`)
      .toString();
    playlist = JSON.parse(playlist);
    assert.equal(2, playlist.length);
  });

  it('temporary mode should work', () => {
    let playlist: any = cp.execSync(
      `${BIN_PATH} ${TEST_SONGS[0]} --temporary --stdout`
    );
    playlist = JSON.parse(playlist);
    assert.equal(1, playlist.length);
    assert.equal(true, ORIGINAL_REGEX.test(playlist[0].src));
  });
});
