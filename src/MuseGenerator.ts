import honoka from 'honoka';
import * as _ from 'lodash';
import Config from './Config';
import IMuseItem from './IMuseItem';
import IGeneratorOptions from './IGeneratorOptions';
import registerHonoka from './registerHonoka';

export default class MuseGenerator {
  private args: Array<any>;
  private options: IGeneratorOptions = [] as any;

  public constructor(...args: Array<any>) {
    registerHonoka();
    this.args = this.parseInput(args);
  }

  private parseInput(args: Array<any>): Array<any> {
    if (args.length === 0) {
      throw new Error('invalid input');
    }

    const lastItem: any = _.last(args);
    if (typeof lastItem === 'object') {
      this.options = lastItem;
      args.pop();
    }

    return args;
  }

  private parseResponse(response: any): any {
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

  private joinArtists(artists: Array<any>): string {
    return artists.map(artist => artist.name).join('/');
  }

  public async build(): Promise<string> {
    const playlist: Array<IMuseItem> = [];

    for (const id of this.args) {
      if (!/^[0-9]*[1-9][0-9]*$/.test(id)) {
        throw new Error('invalid song ID');
      }
      const item: IMuseItem = {} as any;
      let songResponse: any = await honoka.get(
        `/song/detail/?id=${id}&ids=%5B${id}%5D`
      );
      songResponse = this.parseResponse(songResponse);

      if (!songResponse.songs[0]) {
        throw new Error(`song ID ${id} is not exist`);
      }
      songResponse = songResponse.songs[0];

      item.title = songResponse.name;
      item.artist =
        songResponse.artists.length > 1
          ? this.joinArtists(songResponse.artists)
          : songResponse.artists[0].name;
      item.cover = songResponse.album.picUrl
        .replace('http://', '//')
        .replace('https://', '//');
      item.src = `${Config.KotoriBaseURL}/netease/${id}.mp3`;

      if (this.options.temporary) {
        await honoka.get(item.src, {
          redirect: 'manual'
        });
        item.src = honoka.response.headers.get('location');
      }

      let lyricResponse: any = await honoka.get(
        `/song/lyric?os=pc&id=${id}&lv=-1&kv=-1&tv=-1`
      );
      lyricResponse = this.parseResponse(lyricResponse);

      item.lyric = _.get(lyricResponse, 'lrc.lyric');
      item.translation = _.get(lyricResponse, 'tlyric.lyric');

      playlist.push(item);
    }

    return JSON.stringify(playlist, null, 2);
  }
}
