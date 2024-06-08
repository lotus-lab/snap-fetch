import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export const request = async <T, R = AxiosResponse<T>>(
  config: AxiosRequestConfig
): Promise<R> => {
  try {
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.error("Request error:", error);
    throw error;
  }
};
