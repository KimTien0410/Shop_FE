import axios from "axios";

const axiosPrivate = axios.create({
  baseURL: "https://shop-be-1.onrender.com/api",
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
