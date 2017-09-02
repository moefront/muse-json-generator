import assert from 'power-assert';
import generator from '../src/generator';

describe('muse-json-generator', () => {
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
});
