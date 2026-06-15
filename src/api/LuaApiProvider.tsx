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
  const [luaApi, setLuaApi] = useState<OpenSpaceLibrary | null>(null);
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
    async function fetchLuaApi() {
      try {
        const OpenSpaceApi = await api.library();
        setLuaApi(OpenSpaceApi);
      } catch (error) {
        console.error(`Failed to fetch Lua API: ${error}`);
      }
    }

    if (isConnected) {
      fetchLuaApi();
    }
  }, [isConnected]);

  return <LuaApiContext.Provider value={luaApi}>{children}</LuaApiContext.Provider>;
}
