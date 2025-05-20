import axiosPublic from "@/config/axiosPublic";

export const getAllPaymentMethods = async () => {
    try {
        const response = await axiosPublic.get(
        `/payment-methods`
        );
        console.log("Response payment method data:", response.data); // Log the response data
        return response.data;
    } catch (error) {
        console.error("Error fetching payment methods:", error);
        throw error;
    }
}
export const getPaymentMethodById = async (paymentMethodId) => {
    try {
        const response = await axiosPublic.get(`payment-methods/${paymentMethodId}`)
        return response.data;
    } catch (error) {
        console.error("Error fetching payment method:", error);
        throw error;
    }
}