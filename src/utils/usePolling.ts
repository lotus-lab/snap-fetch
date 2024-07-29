import { useCallback, useEffect, useRef } from 'react';
import type { RefetchOptions } from '../types/types';

interface Props {
  pollingInterval: number | undefined;
  refetch: (options?: RefetchOptions) => void;
}
export const usePolling = ({ refetch, pollingInterval }: Props) => {
  /** @Polling */

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();

    if (pollingInterval) {
      timerRef.current = setInterval(() => {
        refetch({
          staleWhileRevalidate: true,
        });
      }, pollingInterval * 1000);
    }
  }, [pollingInterval, JSON.stringify(refetch), stopTimer]);

  useEffect(() => {
    startTimer();

    return () => {
      stopTimer();
    };
  }, [startTimer, stopTimer]);
  return {};
};
