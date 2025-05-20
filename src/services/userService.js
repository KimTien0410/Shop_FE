import axiosPrivate from "../config/axiosPrivate";

export const getProfile = async () => {
    try {
        const response = await axiosPrivate.get("/users/profile");
        return response.data;
    }
    catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
  }
export const updateProfile = async (formData) => {
    try {
        const response = await axiosPrivate.put(
          "/users/update-profile",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
}


export const getUsers = async (page, size) => {
    const response = await axiosPrivate.get(
      `users/by-role?roleName=USER&page=${page}&size=${size}`
    );
    console.log("Response user data:", response.data); // Log the response data
  return response.data;
}
export const addUser = async (user) => {
    const response = await axiosPrivate.post("/users", user);
    return response.data;
};
export const updateUser = async (userId, user) => {
    const response = await axiosPrivate.put(`/users/${userId}`, user);
    return response.data;
};
export const deleteUser = async (userId) => {
    const response = await axiosPrivate.delete(`/users/${userId}`);
    return response.data;
};
export const restoreUser = async (userId) => {
    const response = await axiosPrivate.patch(`/users/restore/${userId}`);
    return response.data;
};