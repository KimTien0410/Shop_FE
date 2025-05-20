import axiosPrivate from "../config/axiosPrivate";
import axiosPublic from "../config/axiosPublic";


export const getAllBrands = async () => {
  const response = await axiosPublic.get("/brands");
  // console.log("Response brand data:", response.data); // Log the response data
  return response.data;
};

export const getBrands = async (page, size) => {
    const response = await axiosPrivate.get(`/brands/admin/all?page=${page}&size=${size}`);
    console.log("Response brand data:", response.data); // Log the response data
  return response.data;
};
export const getBrandAdmin = async () => {
  const response = await axiosPrivate.get(
    `/brands/admin/all`
  );
  console.log("Response brand data:", response.data); // Log the response data
  return response.data;
};

export const addBrand = async (brand) => {
  const response = await axiosPrivate.post("/brands", brand);
  return response.data;
};

export const updateBrand = async (brandId, brand) => {
  const response = await axiosPrivate.put(`/brands/${brandId}`, brand);
  return response.data;
};

export const deleteBrand = async (brandId) => {
  const response = await axiosPrivate.delete(`/brands/${brandId}`);
  return response.data;
};

export const restoreBrand = async (brandId) => {
  const response = await axiosPrivate.patch(`/brands/restore/${brandId}`);
  return response.data;
};