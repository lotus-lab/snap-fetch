import { useCallback, useEffect, useRef, useState } from "react";
import { useNetworkStatus } from "../useNetworkStatus";
import type { RefetchOptions } from "../../types/types";

export function useQueryNetworkStatus(
  refetch: (options?: RefetchOptions) => void,
  disableRefetchOnReconnect: boolean | undefined
) {
  const { isOnline } = useNetworkStatus();
  const onlineRef = useRef(isOnline);
  const [networkStatusChanged, setNetworkStatusChanged] = useState(false);

  const getNetworkStatusChanged = useCallback(() => {
    if (isOnline !== onlineRef.current) {
      onlineRef.current = isOnline;
      setNetworkStatusChanged(true);
    } else {
      setNetworkStatusChanged(false);
    }
  }, [isOnline]);

  useEffect(() => {
    getNetworkStatusChanged();
  }, [getNetworkStatusChanged]);

  useEffect(() => {
    if (isOnline && networkStatusChanged && !disableRefetchOnReconnect) {
      refetch({
        staleWhileRevalidate: true,
      });
    }
  }, [networkStatusChanged, isOnline, refetch, disableRefetchOnReconnect]);
}
