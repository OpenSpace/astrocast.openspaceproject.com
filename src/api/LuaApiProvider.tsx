import { type PropsWithChildren, useEffect, useState } from 'react';
import type { OpenSpaceLibrary } from 'openspace-api-js/types';

import { useIsConnectionStatus } from '@/hooks/util';
import { closeConnection } from '@/redux/connection/connectionMiddleware';
import { startConnection } from '@/redux/connection/connectionSlice';
import { useAppDispatch } from '@/redux/hooks';
import { ConnectionStatus } from '@/types/enums';

import { api } from './api';
import { LuaApiContext } from './LuaApiContext';

export function LuaApiProvider({ children }: PropsWithChildren) {
  const [fetchedLuaApi, setFetchedLuaApi] = useState<OpenSpaceLibrary | null>(null);
  const isConnected = useIsConnectionStatus(ConnectionStatus.Connected);
  const dispatch = useAppDispatch();

  // Connect to OpenSpace
  useEffect(() => {
    dispatch(startConnection());
    return () => {
      dispatch(closeConnection());
    };
  }, [dispatch]);

  // Get Lua API once the connection has been made
  useEffect(() => {
    if (!isConnected) {
      return;
    }

    let ignoreFetchedApi = false;

    async function fetchLuaApi() {
      try {
        const OpenSpaceApi = await api.library();
        // If there is a slow in-flight fetch from a previous connection, do not overwrite
        // the state after a disconnect/reconnect cycle
        if (!ignoreFetchedApi) {
          setFetchedLuaApi(OpenSpaceApi);
        }
      } catch (error) {
        console.error(`Failed to fetch Lua API: ${error}`);
      }
    }

    fetchLuaApi();

    return () => {
      ignoreFetchedApi = true;
    };
  }, [isConnected]);

  // Derive the null-on-disconnect case during render instead of resetting state
  // synchronously from an effect (avoids cascading-render setState-in-effect warnings).
  const luaApi = isConnected ? fetchedLuaApi : null;

  return <LuaApiContext.Provider value={luaApi}>{children}</LuaApiContext.Provider>;
}
