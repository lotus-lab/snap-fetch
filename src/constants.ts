import { EndpointResult } from "./types/types";

export const endpointInitial: EndpointResult = {
  isLoading: false,
  isError: false,
  error: undefined,
  data: undefined,
  pagination: {},
  success: false,
  mutation: false,
  query: false,
  tags: undefined,
  queryParams: new URLSearchParams(""),
};
