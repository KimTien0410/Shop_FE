import axiosPrivate from "../config/axiosPrivate";

export const createOrder = async (orderData) => {
    try {
        const response = await axiosPrivate.post("/orders", orderData,{
            headers: { "Content-Type": "application/json" },
        });
        return response.data;
    } catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
};

export const getOrderHistory = async (page = 0, size = 10) => {
    try {
        const response = await axiosPrivate.get(
          `/orders?page=${page}&size=${size}`
        );
        console.log("Response order history data:", response.data); // Log the response data
        return response.data;
    } catch (error) {
        console.error("Error fetching order history:", error);
        throw error;
    }
};

export const cancelOrder = async (orderId) => {
    try {
        const response = await axiosPrivate.patch(`/orders/cancel/${orderId}`);
        return response.data;
    } catch (error) {
        console.error("Error canceling order:", error);
        throw error;
    }
}

export const getOrderById = async (orderId) => {
    try {
        const response = await axiosPrivate.get(`/orders/${orderId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching order:", error);
        throw error;
    }
};
export const getAllOrders = async (page = 0, size = 10) => {
    try {
        const response = await axiosPrivate.get(
          `/orders/admin?page=${page}&size=${size}`
        );
        console.log("Response order history data:", response.data); // Log the response data
        return response.data;
    } catch (error) {
        console.error("Error fetching order history:", error);
        throw error;
    }
}


export const updateOrderStatus = async (orderId) => {
    try {
        const response = await axiosPrivate.patch(
          `/orders/update-status/${orderId}`);
        return response.data;
    } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
    }
};

export const cancelOrderByAdmin = async (orderId) => {
    try {
        const response = await axiosPrivate.patch(
          `/orders/admin/cancel/${orderId}`);
        return response.data;
    } catch (error) {
        console.error("Error canceling order:", error);
        throw error;
    }
}