import axiosPrivate from "../config/axiosPrivate";

export const totalOrderWithStatus = async () => {
    try {
        const response = await axiosPrivate.get(
          "/statistics/orders/status"
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching total order with status:", error);
        throw error;
    }
}
export const getTotalUserProductRevenue = async () => {
    try {
        const response = await axiosPrivate.get(
          "/statistics/total-product-user-revenue"
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching total user product revenue:", error);
        throw error;
    }
}



export const getDailyRevenue = async (start, end) => {
    try {
        const response = await axiosPrivate.get(
          `/statistics/revenue-chart?type=day&startDate=${start}&endDate=${end}`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching daily revenue:", error);
        throw error;
    }
}

export const getMonthlyRevenue = async (start, end) => {
  try {
    const response = await axiosPrivate.get(
      `/statistics/revenue-chart?type=month&startDate=${start}&endDate=${end}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    throw error;
  }
};

export const getTopSellingProducts = async (start, end, limit) => {
  try {
    const response = await axiosPrivate.get(
      `/statistics/top-selling-products?startDate=${start}&endDate=${end}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    throw error;
  }
};