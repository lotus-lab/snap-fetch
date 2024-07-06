import { useSelector } from "react-redux";
import type { EndpointResult, RequestOptions } from "../../types/types";
import { useMemo } from "react";
import { selectSagaQueryApiConfig } from "../../selectors/selectors";

interface Options<T, ActualApiRes> {
  sagaQueryData: EndpointResult;
  endpoint: string;
  requestOptions: RequestOptions<T, ActualApiRes>;
  hashKey: string;
}

export function useQueryPayload<T, ActualApiRes>({
  endpoint,
  hashKey,
  requestOptions,
  sagaQueryData,
}: Options<T, ActualApiRes>) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    JSON.stringify(requestOptions),
    JSON.stringify(baseConfig),
    hashKey,
    endpoint,
    sagaQueryData?.pagination?.pageNo,
    sagaQueryData?.pagination?.size,
  ]);
}
