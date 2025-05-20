import axios from "axios";
import axiosPrivate from "../config/axiosPrivate";

export const addAddress = async (addressData) => {
    try {
        const response = await axiosPrivate.post("receiver-addresses", addressData, {
            headers: { "Content-Type": "application/json" },
        });
        return response.data;
    } catch (error) {
        console.error("Error adding address:", error);
        throw error;
    }
}
export const getAllAddress = async () => {
    try {
        const response = await axiosPrivate.get("receiver-addresses")
        console.log("Response data:", response.data); // Log the response data
        return response.data;
    } catch (error) {
        console.error("Error fetching addresses:", error);
        throw error;
    }
}
export const getAddressById = async (addressId) => {
    try {
        const response = await axiosPrivate.get(`receiver-addresses/${addressId}`)
        return response.data;
    } catch (error) {
        console.error("Error fetching address:", error);
        throw error;
    }
}
export const updateAddress = async (addressId, addressData) => {
    try {
        const response = await axiosPrivate.put(`receiver-addresses/${addressId}`, addressData, {
            headers: { "Content-Type": "application/json" },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating address:", error);
        throw error;
    }
}
export const deleteAddress = async (addressId) => {
    try {
        const response = await axiosPrivate.delete(`receiver-addresses/${addressId}`)
        return response.data;
    } catch (error) {
        console.error("Error deleting address:", error);
        throw error;
    }
}
export const setDefaultAddress = async (addressId) => {
    try {
        const response = await axiosPrivate.patch(
          `receiver-addresses/set-default/${addressId}`
        );
        return response.data;
    } catch (error) {
        console.error("Error setting default address:", error);
        throw error;
    }
}
export const getDefaultAddress = async () => {
    try {
        const response = await axiosPrivate.get("receiver-addresses/default")
        return response.data;
    } catch (error) {
        console.error("Error fetching default address:", error);
        throw error;
    }
}

export const getCities = async () => {
    try {
        const response = await axios.get(
          "https://vn-public-apis.fpo.vn/provinces/getAll?limit=-1"
        );
        console.log("Response data city:", response.data.data); // Log the response data
        return response.data;
    } catch (error) {
        console.error("Error fetching cities:", error);
        throw error;
    }
}
export const getDistricts = async (cityId) => {
    try {
        const response = await axios.get(
          `https://vn-public-apis.fpo.vn/districts/getByProvince?provinceCode=${cityId}`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching districts:", error);
        throw error;
    }
}
export const getWards = async (districtId) => {
    try {
        const response = await axios.get(
          `https://vn-public-apis.fpo.vn/wards/getByDistrict?districtCode=${districtId}`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching wards:", error);
        throw error;
    }
}