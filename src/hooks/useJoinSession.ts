import { useCallback } from 'react';

import { useOpenSpaceApi } from '@/api/hooks';
import { useAppDispatch } from '@/redux/hooks';
import { setConnectedSessionId } from '@/redux/local/localSlice';
import type { SessionData } from '@/types/types';

export function useJoinSession(
  session: SessionData | null | undefined,
  hostPassword: string | null,
  name: string
) {
  const luaApi = useOpenSpaceApi();
  const dispatch = useAppDispatch();

  const joinSession = useCallback(() => {
    if (!luaApi || !session) {
      return;
    }

    luaApi?.parallel.joinServer(
      import.meta.env.VITE_WORMHOLE_PORT,
      import.meta.env.VITE_WORMHOLE_ADDRESS,
      session.roomName,
      session.password,
      hostPassword ?? '',
      name
    );
    dispatch(setConnectedSessionId(session));
  }, [dispatch, luaApi, session, hostPassword, name]);

  return joinSession;
}
