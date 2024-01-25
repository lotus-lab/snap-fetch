import { EndpointResult } from "./types/types";

export const endpointInitial: EndpointResult = {
  isLoading: false,
  isError: false,
  error: undefined,
  data: undefined,
  pagination: {
    pageNo: 1,
    size: 10,
  },
  success: false,
  mutation: false,
  query: false,
  tags: undefined,
  queryParams: new URLSearchParams(""),
};
