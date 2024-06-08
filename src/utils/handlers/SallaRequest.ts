import axios, { AxiosRequestConfig } from "axios";

export default function SallaRequest({
  url,
  method,
  data,
  token,
}: AxiosRequestConfig & { token: string }) {
  const options: AxiosRequestConfig = {
    baseURL: process.env.SALLA_API_URL,
    url,
    method,
    data,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  return axios.request(options);
}
