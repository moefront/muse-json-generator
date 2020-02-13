import honoka, { HonokaRequestOptions } from 'honoka';
// import * as ProxyAgent from 'https-proxy-agent';
// import * as getProxy from 'get-proxy';
import Config from './Config';

let hasRegistered: boolean = false;

export default function registerHonoka(): void {
  if (hasRegistered) {
    return;
  }

  // const sysProxy = getProxy();
  // console.log(sysProxy);

  honoka.defaults.baseURL = Config.NeteaseBaseURL;
  honoka.interceptors.register({
    request: (options: HonokaRequestOptions) => {
      // if (sysProxy) {
      //   options.agent = new ProxyAgent(sysProxy);
      // }
      return options;
    }
  });

  hasRegistered = true;
}
