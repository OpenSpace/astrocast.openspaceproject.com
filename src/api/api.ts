import OpenSpaceApi from 'openspace-api-js';

export let api = OpenSpaceApi('localhost', 4682);

export function initApi(address: string, port: number) {
  api.disconnect();
  api = OpenSpaceApi(address, port);
}
