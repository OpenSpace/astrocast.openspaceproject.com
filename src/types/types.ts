import type { UserInfo } from 'firebase/auth';

export type AuthUser = Pick<UserInfo, 'uid' | 'displayName' | 'email' | 'photoURL'> & {
  isAdmin: boolean;
  providerIds: string[];
};

export interface SessionData {
  id: string;
  active: boolean;
  inactiveTimestamp: number;
  created: number;
  password: string;
  usage: number;
  nPeers: number;
  currentHost: string;
  roomName: string;
  profile: string;
  isPrivate: boolean;
  owner: string;
}

export interface SessionHistoryData {
  id: string;
  inactiveTimestamp: number;
  created: number;
  uptime: number;
  usagE: number;
  roomName: string;
  owner: string | null;
}

export interface StatisticData {
  nPeers: number;
  timestamp: number;
}

export interface Statistics {
  id: string;
  data: StatisticData[];
}
