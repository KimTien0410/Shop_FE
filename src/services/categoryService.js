import axiosPublic from "@/config/axiosPublic";
import axiosPrivate from "../config/axiosPrivate";
export const getAllCategories = async (page = 0, size = 10) => {
    try {
        const response = await axiosPublic.get(
        `/categories?page=${page}&size=${size}`
        );
        console.log("Response category data:", response.data); // Log the response data
        return response.data.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
}


export const getCategoryById = async (categoryId) => {
    try {
        const response = await axiosPublic.get(
        `/categories/${categoryId}`
        );
        console.log("Response category data:", response.data); // Log the response data
        return response.data.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
}
export const getAllCategoriesByAdmin = async () => {
    let response;
    try {
        response = await axiosPrivate.get(`/categories/admin/getAll`);
        console.log("categories", response); // Log the response data
        if (response.status === 200) {
            return response.data.data;
        } else {
            throw new Error("Failed to fetch categories");
        }
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
}

export const createCategory = async (formData) => {
  const response= await axiosPrivate.post("/categories", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
   return response.data.data;
   
};

export const updateCategory = async (categoryId, formData) => {
  const response = await axiosPrivate.put(`/categories/${categoryId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
    return response.data.data;
};


export const deleteCategory = async (categoryId) => {
    try {
        const response = await axiosPrivate.delete(
            `/categories/${categoryId}`
        );
        console.log(response);
        if (response.status === 200) {
            return response.data.data;
        } else {
            throw new Error("Failed to delete category");
        }
    } catch (error) {
        console.error("Error deleting category:", error);
        throw error;
    }
}
export const restoreCategory = async (categoryId) => {
    try {
        const response = await axiosPrivate.patch(
            `/categories/restore/${categoryId}`
        );
        console.log(response);
        if (response.status === 200) {
            return response.data.data;
        } else {
            throw new Error("Failed to restore category");
        }
    } catch (error) {
        console.error("Error restoring category:", error);
        throw error;
    }
}
