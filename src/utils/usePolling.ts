import { useCallback, useEffect, useRef } from "react";

interface Props {
  pollingInterval: number | undefined;
  fetchData: (isPolling?: boolean) => Promise<void>;
}
export const usePolling = ({ fetchData, pollingInterval }: Props) => {
  /** @Polling */

  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
        fetchData(true);
      }, pollingInterval * 1000);
    }
  }, [pollingInterval, fetchData, stopTimer]);

  useEffect(() => {
    startTimer();

    return () => {
      stopTimer();
    };
  }, [fetchData, startTimer, stopTimer]);
  return {};
};
