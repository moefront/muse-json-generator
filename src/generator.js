import honoka from 'honoka';

honoka.defaults.baseURL = 'http://music.163.com/api';

function parseResponse(response) {
  try {
    response = JSON.parse(response);
  } catch (e) {
    throw new Error('response is not a valid json string');
  }

  if (response.code !== 200) {
    throw new Error('response code is not valid', response.code);
  }

  return response;
}

function joinArtists(artists) {
  return artists.map(artist => artist.name).join('/');
}

async function generator(...args) {
  if (args.length === 0) {
    throw new Error('invalid input');
  }

  const result = [];

  for (const id of Array.from(args)) {
    if (!/^[0-9]*[1-9][0-9]*$/.test(id)) {
      throw new Error('invalid song ID');
    }
    const item = {};
    let songResponse = await honoka.get(`/song/detail/?id=${id}&ids=%5B${id}%5D`);
    songResponse = parseResponse(songResponse);

    if (!songResponse.songs[0]) {
      throw new Error(`song ID ${id} is not exist`);
    }
    songResponse = songResponse.songs[0];

    item.title = songResponse.name;
    item.artist =
      songResponse.artists.length > 1
        ? joinArtists(songResponse.artists)
        : songResponse.artists[0].name;
    item.cover = songResponse.album.picUrl;
    item.src = `https://api.kotori.love/netease/${id}.mp3`;

    generator.options = generator.options || {};
    if (generator.options.temporary) {
      await honoka.get(item.src, {
        redirect: 'manual'
      });
      item.src = honoka.response.headers.get('location');
    }

    let lyricResponse = await honoka.get(
      `/song/lyric?os=pc&id=${id}&lv=-1&kv=-1&tv=-1`
    );
    lyricResponse = parseResponse(lyricResponse);

    item.lyric = lyricResponse.lrc.lyric;
    item.translation = lyricResponse.tlyric.lyric;

    ['lyric', 'translation'].forEach(key => {
      if (item[key] === null) {
        delete item[key];
      }
    });

    result.push(item);
  }

  return JSON.stringify(result, null, 2);
}

export default generator;
