import axios from "axios";

const axiosPublic = axios.create({
  baseURL: "https://shop-be-1.onrender.com/api",
});

export default axiosPublic;
