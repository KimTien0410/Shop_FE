import axiosPublic from "@/config/axiosPublic";

export const getAllDeliveryMethods = async () => {
    try {
        const response = await axiosPublic.get(`/delivery-methods`);
        console.log("Response delivery method data:", response.data); // Log the response data
        return response.data;
    } catch (error) {
        console.error("Error fetching delivery methods:", error);
        throw error;
    }
}
export const getDeliveryMethodById = async (deliveryMethodId) => {
    try {
        const response = await axiosPublic.get(`delivery-methods/${deliveryMethodId}`)
        return response.data;
    } catch (error) {
        console.error("Error fetching delivery method:", error);
        throw error;
    }
}