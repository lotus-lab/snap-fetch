import { useCallback, useEffect, useRef } from "react";

interface Props {
  pollingInterval: number | undefined;
  refetch: () => void;
}
export const usePolling = ({ refetch, pollingInterval }: Props) => {
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
        refetch();
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
