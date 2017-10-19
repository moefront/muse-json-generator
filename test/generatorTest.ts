///<reference path="../node_modules/@types/node/index.d.ts"/>
///<reference path="../node_modules/@types/mocha/index.d.ts"/>
///<reference path="../node_modules/@types/power-assert/index.d.ts"/>

import * as assert from 'power-assert';
import * as cp from 'child_process';
import { URL } from 'url';
import * as path from 'path';
import honoka from 'honoka';
import * as generator from '../lib/generator';

describe('muse-json-generator', () => {
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
    let playlist = await generator(477331181, 480097777);
    playlist = JSON.parse(playlist);
    assert.equal(true, Array.isArray(playlist));
    assert.equal(2, playlist.length);
  });

  it('output should contain specified keys', async () => {
    let playlist = await generator(477331181);
    playlist = JSON.parse(playlist);
    ['title', 'artist', 'cover', 'src', 'lyric', 'translation'].forEach(key => {
      assert.equal(
        true,
        Object.prototype.hasOwnProperty.call(playlist[0], key)
      );
    });
  });

  it('artists should be divided with / when a song has more than one artist', async () => {
    let playlist = await generator(26214326);
    playlist = JSON.parse(playlist);
    assert.equal(
      true,
      String.prototype.indexOf.call(playlist[0].artist, '/') > -1
    );
  });

  it('src should contain temporary link when user apply temporary mode', async () => {
    let playlist: any = await generator(26214326, {
      temporary: true
    });
    playlist = JSON.parse(playlist);
    const src = playlist[0].src;

    assert.equal(true, /music.126.net/.test(src));

    const srcURL = new URL(src);

    if (/music.126.net/.test(srcURL.host)) {
      await honoka.head(
        `https://api.kotori.love/netease/${srcURL.host}${srcURL.pathname}`
      );
      assert.equal(200, honoka.response.status);
      assert.equal('audio/mpeg', honoka.response.headers.get('Content-Type'));
    }
  });

  it('stdout mode should work', async () => {
    let playlist: any = cp
      .execSync(
        `node ${path.join(__dirname, '/../bin/muse.js')} 477331181 --stdout`
      )
      .toString();
    playlist = JSON.parse(playlist);
    assert.equal(1, playlist.length);
  });
});
