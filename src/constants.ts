import { EndpointResult } from "./types/types";

export const endpointInitial: EndpointResult = {
  isLoading: false,
  isError: false,
  error: undefined,
  data: undefined,
  success: false,
  mutation: false,
  query: false,
  tag: undefined,
  queryParams: new URLSearchParams(""),
  pagination: { pageNo: 1, size: 10 },
};
