import { useGetSessionsQuery } from '@/redux/api/databaseApiSlice';
import { useAppSelector } from '@/redux/hooks';

export function useSessions() {
  const query = useGetSessionsQuery();
  const { user } = useAppSelector((state) => state.auth);

  const data = query.data ?? [];

  const sessions = user?.isAdmin
    ? data
    : data.filter((session) => !session.isPrivate || session.owner === user?.uid);

  return { ...query, sessions };
}
