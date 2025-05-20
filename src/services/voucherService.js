import axiosPrivate from "../config/axiosPrivate";
import axiosPublic from "../config/axiosPublic";

export const getAllVoucher = async (page, size) => {
    const response = await axiosPrivate.get(
      `vouchers/admin/all?page=${page}&size=${size}`
    );
    return response.data;
};
export const createVoucher = async (voucher) => {
    const response = await axiosPrivate.post("/vouchers", voucher);
    return response.data;
};
export const updateVoucher = async (voucherId, voucher) => {
    const response = await axiosPrivate.put(`/vouchers/${voucherId}`, voucher);
    return response.data;
};
export const deleteVoucher = async (voucherId) => {
    const response = await axiosPrivate.delete(`/vouchers/${voucherId}`);
    return response.data;
};

export const getVoucherActive = async () => {
    const response = await axiosPublic.get(
      `vouchers`
    );
    return response.data;
}

export const getVoucherByCode = async (code) => {
    const response = await axiosPublic.get(
      `vouchers/${code}`
    );
    return response.data;
}
export const getVoucherById = async (voucherId) => {
    const response = await axiosPrivate.get(
      `vouchers/${voucherId}`
    );
    return response.data;
}
export const applyVoucher = async (request) => {
    const response = await axiosPrivate.post(
      `vouchers/apply`, request
    );
    return response.data;
}