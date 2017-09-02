import honoka from 'honoka';

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

async function generator() {
  if (arguments.length === 0) {
    throw new Error('invalid input');
  }

  const result = [];

  for (const id of Array.from(arguments)) {
    if (!/^[0-9]*[1-9][0-9]*$/.test(id)) {
      throw new Error('invalid song ID');
    }
    const item = {};
    let songDetail = await honoka.get(
      `http://music.163.com/api/song/detail/?id=${id}&ids=%5B${id}%5D`
    );
    songDetail = parseResponse(songDetail);

    songDetail = songDetail.songs[0];

    item.title = songDetail.name;
    item.artist =
      songDetail.artists.length > 1
        ? joinArtists(songDetail.artists)
        : songDetail.artists[0].name;
    item.cover = songDetail.album.picUrl;
    item.src = `https://api.kotori.love/netease/${id}.mp3`;

    let lyricDetail = await honoka.get(
      `http://music.163.com/api/song/lyric?os=pc&id=${id}&lv=-1&kv=-1&tv=-1`
    );
    lyricDetail = parseResponse(lyricDetail);

    item.lyric = lyricDetail.lrc.lyric;
    item.translation = lyricDetail.tlyric.lyric;

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
