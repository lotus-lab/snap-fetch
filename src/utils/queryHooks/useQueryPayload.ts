import { useSelector } from "react-redux";
import { useMemo } from "react";
import type { EndpointKey, EndpointResult } from "../../types/types";
import { selectSnapFetchApiConfig } from "../../selectors/selectors";

interface Options {
  sagaQueryData: EndpointResult;
  endpoint: string;
  requestOptions: any;
  hashKey: EndpointKey;
}

export function useQueryPayload({
  endpoint,
  hashKey,
  requestOptions,
  sagaQueryData,
}: Options) {
  const baseConfig = useSelector(selectSnapFetchApiConfig);
  return useMemo(() => {
    return {
      ...baseConfig,
      ...requestOptions,
      endpoint,
      query: true,
      mutation: false,
      hashKey,
      fetchFunctionIsOutsider: !!requestOptions.fetchFunction,
      createdAt: new Date(),
      pagination: {
        pageNo: sagaQueryData?.pagination?.pageNo ?? 1,
        size: sagaQueryData?.pagination?.size ?? 10,
      },
    };
  }, [
    JSON.stringify(requestOptions),
    JSON.stringify(baseConfig),
    hashKey,
    endpoint,
    sagaQueryData?.pagination?.pageNo,
    sagaQueryData?.pagination?.size,
  ]);
}
