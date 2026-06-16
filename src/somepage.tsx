import { useIsConnectionStatus } from './hooks/util';
import { ConnectionStatus } from './types/enums';

export function Foo() {
  const isConnected = useIsConnectionStatus(ConnectionStatus.Connected);
  return <div>{isConnected ? 'Connected' : 'Not Connected'}</div>;
}
