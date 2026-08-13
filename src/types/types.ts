import type { ReactNode } from 'react';
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
  usage: number;
  password: string;
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
  usage: number;
  roomName: string;
  owner: string;
}

export interface StatisticData {
  nPeers: number;
  timestamp: number;
}

export interface Statistics {
  id: string;
  data: StatisticData[];
}

export interface DetailItem {
  label: string;
  value: ReactNode;
}
