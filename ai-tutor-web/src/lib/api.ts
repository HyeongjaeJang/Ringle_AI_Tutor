import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((cfg) => {
  if (cfg.url?.startsWith("/api/")) {
    cfg.baseURL = "";
    cfg.withCredentials = false;
  }
  return cfg;
});

export default api;
