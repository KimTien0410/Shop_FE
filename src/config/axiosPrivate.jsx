import axios from "axios";

const axiosPrivate = axios.create({
  baseURL: "http://localhost:8080/api",
});
// Interceptor để thêm token vào header khi có request
axiosPrivate.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosPrivate;
