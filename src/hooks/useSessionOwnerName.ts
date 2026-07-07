import { useFetchUserNameQuery } from '@/redux/api/wormholeApiSlice';

export function useSessionOwnerName(uid: string) {
  const query = useFetchUserNameQuery(uid);
  return query.data ?? uid ?? 'Unknown';
}
