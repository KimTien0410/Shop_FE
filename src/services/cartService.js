import axiosPrivate from "../config/axiosPrivate";

export const getCart = async () => {
    try {
        const response = await axiosPrivate.get("/carts");
        return response.data;
    } catch (error) {
        console.error("Error fetching cart:", error);
        throw error;
    }
}
export const addToCart = async (cartData) => {
    try {
        const response = await axiosPrivate.post("/carts", cartData,  {
          headers: {
            "Content-Type": "application/json", // Đảm bảo gửi dữ liệu dưới dạng JSON
          },
        });
        console.log("Add to cart response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error adding to cart:", error);
        throw error;
    }
}

export const updateCart = async (cartData) => {
    try {
        const response = await axiosPrivate.put(
          `/carts`,
          cartData,
          {
            headers: {
              "Content-Type": "application/json", // Đảm bảo gửi dữ liệu dưới dạng JSON
            },
          }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating cart:", error);
        throw error;
    }
}
export const deleteCartItem = async (productVariantIds) => {
    try {
        const response = await axiosPrivate.delete(`/carts`, {
            data: { productVariantIds }, // Gửi dữ liệu dưới dạng JSON
            headers: {
                "Content-Type": "application/json", // Đảm bảo gửi dữ liệu dưới dạng JSON
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting cart item:", error);
        throw error;
    }
}

