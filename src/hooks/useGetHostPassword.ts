import { skipToken } from '@reduxjs/toolkit/query';

import { useGetHostPasswordQuery } from '@/redux/api/wormholeApiSlice';
import { useAppSelector } from '@/redux/hooks';
import type { SessionData } from '@/types/types';

export function useGetHostPassword(session: SessionData | null | undefined) {
  const { user } = useAppSelector((state) => state.auth);
  const isOwner = session != null && user?.uid === session.owner;

  const query = useGetHostPasswordQuery(isOwner ? session.id : skipToken);

  const data = query.data ?? '';
  const hostPassword = isOwner ? data : '';

  return { ...query, isOwner, hostPassword };
}
