import axiosPrivate from "../config/axiosPrivate";
import axiosPublic from "../config/axiosPublic";

export const submitReview = async (reviewData) => {
  try {
    const response = await axiosPrivate.post(
      "/reviews",
      reviewData,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting review:", error);
    throw error;
  }
};
export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await axiosPrivate.put(
      `/reviews/${reviewId}`,
      reviewData,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating review:", error);
    throw error;
  }
};
export const deleteReview = async (reviewId) => {
  try {
    const response = await axiosPrivate.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
};
export const getReviewsByProduct = async (productId) => {
  try {
    const response = await axiosPublic.get(`/reviews/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }
};
export const getAverageRating = async (productId) => {
  try {
    const response = await axiosPublic.get(`/reviews/product/${productId}/average`);
    return response.data;
  } catch (error) {
    console.error("Error fetching average rating:", error);
    throw error;
  }
};
