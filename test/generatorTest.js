import assert from 'power-assert';
import { execSync } from 'child_process';
import { URL } from 'url';
import path from 'path';
import honoka from 'honoka';
import generator from '../src/generator';

describe('muse-json-generator', () => {
  beforeEach(() => {
    generator.options = {};
  });

  it('input a non-numberic value should throw error', async () => {
    let err;
    try {
      const playlist = await generator('niconiconi');
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
    generator.options = {
      temporary: true
    };
    let playlist = await generator(26214326);
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
    let playlist = execSync(
      `node ${path.join(__dirname, '/../bin/muse.js')} 477331181 --stdout`
    ).toString();
    playlist = JSON.parse(playlist);
    assert.equal(1, playlist.length);
  });
});
