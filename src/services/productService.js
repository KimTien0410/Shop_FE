import axiosPublic from "@/config/axiosPublic";

export const getAllProductNewArrivals = async (page =0,size=10) => {
    try {
        const response = await axiosPublic.get(
          `/products/filter?isNewArrival=true&page=${page}&sizePage=${size}`
        );
        console.log("Response data:", response.data); // Log the response data
        return response.data.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
}
export const getAllBestSellingProducts = async(page=0,size=10)=> {
    try {
        const response = await axiosPublic.get(
          `/products/filter?isBestSeller=true&page=${page}&sizePage=${size}`
        );
        console.log("Response data:", response.data); // Log the response data
        return response.data.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
}


export const getAllProducts = async (page=0,sizePerPage=12) => {
    try {
        const response = await axiosPublic.get(
          `/products/filter?page=${page}&sizePerPage=${sizePerPage}`
        );
        // console.log("Response data:", response.data.data.content); // Log the response data
        return response.data.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
}

export const searchProducts = async (query, page = 0, size = 10) => {
    try {
        const response = await axiosPublic.get(
            `/products/filter?search=${query}&page=${page}&sizePerPage=${size}`
        );
        console.log("Response search data:", response.data.data.content); // Log the response data
        return response.data.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
}

export const getProductByCategoryId = async (categoryId =null, page = 0, size = 10) => {
    try {
        const response = await axiosPublic.get(
          `/products/category/${categoryId}?page=${page}&size=${size}`
        );
        console.log("Response data:", response.data.data.content); // Log the response data
        return response.data.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
}

export const getProductBySlug = async (slug) => {
    try {
        const response = await axiosPublic.get(
          `/products/slug/${slug}`
        );
        console.log("Response data:", response); // Log the response data
        return response;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
}

export const getProductById = async (productId) => {
    try {
        const response = await axiosPublic.get(
          `/products/${productId}`
        );
        console.log("Response get detail product:", response.data.data); // Log the response data
        return response.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
}

import axiosPrivate from "../config/axiosPrivate";

export const getProducts = async (search,page, size) => {
    const response = await axiosPrivate.get(`/products/admin?search=${search}&page=${page}&size=${size}`);

    return response.data;
};

export const addProduct = async (formData) => {
    const response = await axiosPrivate.post("/products", formData,{
        headers: { "Content-Type": "multipart/form-data" },
      });
    return response.data;
};

export const updateProduct = async (productId, formData) => {
    const response = await axiosPrivate.put(`/products/${productId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const deleteProduct = async (productId) => {
    return await axiosPrivate.patch(`/products/soft-delete/${productId}`);
};

export const restoreProduct = async (productId) => {
    return await axiosPrivate.patch(`/products/restore/${productId}`);
};

export const searchProductAdvances = async (filter, page = 0, sizePerPage = 12) => {
  const response = await axiosPublic.post(
    `/products/search?page=${page}&sizePerPage=${sizePerPage}`,
    filter
  );
  console.log("Response data:", response.data); // Log the response data
  return response.data;
};

export const searchProductAdvances2 = async ({
  search,
  categoryId,
  brandCode,
  color,
  size,
  minPrice,
  maxPrice,
  isNewArrival,
  isBestSeller,
  page = 0,
  sizePerPage = 12,
  orderBy = "productId",
  sortDirection = "desc",
}) => {
  try {
    const body = {
      search,
      categoryId,
      brandCode, // dạng array hoặc set
      color,
      size,
      minPrice,
      maxPrice,
      isNewArrival,
      isBestSeller,
    };
    const params = new URLSearchParams({
      page,
      sizePerPage,
      orderBy,
      sortDirection,
    }).toString();

    const response = await axiosPublic.post(`/products/search?${params}`, body);
    return response.data.data;
  } catch (error) {
    console.error("Error in searchProductAdvances:", error);
    throw error;
  }
};