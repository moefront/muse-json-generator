///<reference path="../node_modules/@types/node/index.d.ts"/>
///<reference path="../node_modules/@types/mocha/index.d.ts"/>
///<reference path="../node_modules/@types/chai/index.d.ts"/>
///<reference path="../node_modules/@types/nock/index.d.ts"/>

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as cp from 'child_process';
import { URL } from 'url';
import * as path from 'path';
import honoka from 'honoka';
import * as nock from 'nock';
import generator = require('../src/generator');

chai.use(chaiAsPromised);

const expect = chai.expect;

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

  it('input a non-numberic value should throw error', () => {
    expect(generator('niconiconi')).to.be.rejectedWith(/invalid song ID/);
  });

  it('input two song ID should output an array contained two objects', async () => {
    let playlist: any = await generator(TEST_SONGS[0], TEST_SONGS[1]);
    playlist = JSON.parse(playlist);
    expect(Array.isArray(playlist)).to.be.true;
    expect(playlist.length).to.equal(2);
  });

  it('output should contain specified keys', async () => {
    let playlist: any = await generator(TEST_SONGS[0]);
    playlist = JSON.parse(playlist);
    PLAYLIST_KEYS.forEach(key => {
      expect(Object.prototype.hasOwnProperty.call(playlist[0], key)).to.be.true;
    });
  });

  it('artists should be divided with / when a song has more than one artist', async () => {
    let playlist: any = await generator(TEST_SONGS[2]);
    playlist = JSON.parse(playlist);
    expect(String.prototype.indexOf.call(playlist[0].artist, '/') > -1).to.be
      .true;
  });

  it('src should contain temporary link when user apply temporary mode', async () => {
    let playlist: any = await generator(TEST_SONGS[0], {
      temporary: true
    });
    playlist = JSON.parse(playlist);
    const src = playlist[0].src;

    expect(ORIGINAL_REGEX.test(src)).to.be.true;

    const srcURL = new URL(src);

    if (ORIGINAL_REGEX.test(srcURL.host)) {
      await honoka.head(
        `https://api.kotori.love/netease/${srcURL.host}${srcURL.pathname}`
      );
      expect(honoka.response.status).to.equal(200);
      expect(honoka.response.headers.get('Content-Type')).to.equal(
        'audio/mpeg'
      );
    }
  });

  it('lyric should be undefined when a song has not lyric', async () => {
    let playlist: any = await generator(TEST_SONGS[4]);
    playlist = JSON.parse(playlist);
    expect(typeof playlist[0].lyric).to.be.equal('undefined');
  });

  it('should throw error when input is empty', () => {
    expect(generator()).to.be.rejectedWith(/invalid input/);
  });

  it('should throw error when song is not found', () => {
    expect(generator(TEST_SONGS[3])).to.be.rejectedWith(
      `song ID ${TEST_SONGS[3]} is not exist`
    );
  });

  it('should throw error when response is not valid', () => {
    nock(/(.*)/)
      .get(/(.*)/)
      .query(() => true)
      .reply(200, '{');

    expect(generator(TEST_SONGS[0])).to.be.rejectedWith(
      /response is not a valid json string/
    );
  });

  it("should throw error when response's code is not 200", () => {
    nock(/(.*)/)
      .get(/(.*)/)
      .query(() => true)
      .reply(200, '{"code":400}');

    expect(generator(TEST_SONGS[0])).to.be.rejectedWith(
      /response code is not valid/
    );
  });
});

describe('generator cli test', () => {
  it('stdout mode should work', () => {
    let playlist: any = cp
      .execSync(`${BIN_PATH} ${TEST_SONGS[0]} --stdout`)
      .toString();
    playlist = JSON.parse(playlist);
    expect(playlist.length).to.equal(1);
  });

  it('stdout mode should work with two song ID', () => {
    let playlist: any = cp
      .execSync(`${BIN_PATH} ${TEST_SONGS[0]} ${TEST_SONGS[1]} --stdout`)
      .toString();
    playlist = JSON.parse(playlist);
    expect(playlist.length).to.equal(2);
  });

  it('temporary mode should work', () => {
    let playlist: any = cp.execSync(
      `${BIN_PATH} ${TEST_SONGS[0]} --temporary --stdout`
    );
    playlist = JSON.parse(playlist);
    expect(playlist.length).to.equal(1);
    expect(ORIGINAL_REGEX.test(playlist[0].src)).to.be.true;
  });
});
