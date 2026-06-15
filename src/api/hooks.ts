import { useContext } from 'react';

import { LuaApiContext } from './LuaApiContext';

export function useOpenSpaceApi() {
  const api = useContext(LuaApiContext);
  return api;
}
