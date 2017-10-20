import honoka from 'honoka';
import * as _ from 'lodash';
import Config from './Config';
import IMuseItem from './IMuseItem';
import IGeneratorOptions from './IGeneratorOptions';

honoka.defaults.baseURL = Config.NeteaseBaseURL;

function parseResponse(response: any) {
  try {
    response = JSON.parse(response);
  } catch (e) {
    throw new Error('response is not a valid json string');
  }

  if (response.code !== 200) {
    throw new Error('response code is not valid');
  }

  return response;
}

function joinArtists(artists: Array<any>): string {
  return artists.map(artist => artist.name).join('/');
}

async function generator(...args: Array<any>): Promise<string> {
  if (args.length === 0) {
    throw new Error('invalid input');
  }

  let options: IGeneratorOptions = {} as any;

  const lastItem: any = args[args.length - 1];
  if (typeof lastItem === 'object') {
    options = lastItem;
    args.pop();
  }

  const playlist: Array<IMuseItem> = [];

  for (const id of args) {
    if (!/^[0-9]*[1-9][0-9]*$/.test(id)) {
      throw new Error('invalid song ID');
    }
    const item: IMuseItem = {} as any;
    let songResponse: any = await honoka.get(
      `/song/detail/?id=${id}&ids=%5B${id}%5D`
    );
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
    item.src = `${Config.KotoriBaseURL}/netease/${id}.mp3`;

    if (options.temporary) {
      await honoka.get(item.src, {
        redirect: 'manual'
      });
      item.src = honoka.response.headers.get('location');
    }

    let lyricResponse: any = await honoka.get(
      `/song/lyric?os=pc&id=${id}&lv=-1&kv=-1&tv=-1`
    );
    lyricResponse = parseResponse(lyricResponse);

    item.lyric = _.get(lyricResponse, 'lrc.lyric');
    item.translation = _.get(lyricResponse, 'tlyric.lyric');

    playlist.push(item);
  }

  return JSON.stringify(playlist, null, 2);
}

export = generator;
