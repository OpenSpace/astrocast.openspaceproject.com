import { useEffect } from 'react';

import { startAuthListening, stopAuthListening } from '@/redux/auth/authMiddleware';
import { useAppDispatch } from '@/redux/hooks';

export function AuthListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(startAuthListening());
    return () => {
      dispatch(stopAuthListening());
    };
  }, [dispatch]);

  return null;
}
