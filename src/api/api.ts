import OpenSpaceApi from 'openspace-api-js';

export let api = OpenSpaceApi('localhost', 4682);

export function initApi(address: string, port: number) {
  // Clear any old instance handers first. Making any pending or in-flight connect/close
  // event from the discarded instance no-op
  api.onConnect(() => {});
  api.onDisconnect(() => {});

  api.disconnect();
  api = OpenSpaceApi(address, port);
}
