import { useAppSelector } from '@/redux/hooks';
import type { ConnectionStatus } from '@/types/enums';

export function useIsConnectionStatus(status: ConnectionStatus): boolean {
  return useAppSelector((state) => state.connection.connectionStatus) === status;
}
