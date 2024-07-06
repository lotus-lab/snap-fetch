import { useSelector } from "react-redux";
import type { EndpointResult } from "../../types/types";
import { useMemo } from "react";
import { selectSagaQueryApiConfig } from "../../selectors/selectors";

interface Options {
  sagaQueryData: EndpointResult;
  endpoint: string;
  requestOptions: any;
  hashKey: string;
}

export function useQueryPayload({
  endpoint,
  hashKey,
  requestOptions,
  sagaQueryData,
}: Options) {
  const baseConfig = useSelector(selectSagaQueryApiConfig);
  return useMemo(() => {
    return {
      ...baseConfig,
      ...requestOptions,
      endpoint,
      query: true,
      mutation: false,
      hashKey,
      fetchFunctionIsOutsider: requestOptions.fetchFunction ? true : false,
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
