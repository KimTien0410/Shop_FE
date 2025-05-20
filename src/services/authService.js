import axiosPublic from "@/config/axiosPublic";

export const login = async (loginData) => {
    try {
        const response = await axiosPublic.post("/auth/login", loginData);
        return response.data;
    } catch (error) {
        console.error("Error during login:", error);
        throw error;
    }
}
export const register = async (userData) => {
    try {
        const response = await axiosPublic.post("/auth/register", userData);
        return response.data;
    } catch (error) {
        console.error("Error during registration:", error);
        throw error;
    }
}