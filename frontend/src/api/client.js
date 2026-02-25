import axios from "axios";
import { backendBaseUrl } from "../config";

const client = axios.create({
  baseURL: backendBaseUrl,
});

export function attachToken(accessToken) {
  client.interceptors.request.use((config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });
}

export default client;

