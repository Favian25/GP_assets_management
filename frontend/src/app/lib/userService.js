import api from "./api";

export const getAllUsers = async () => {
  try {
    const response = await api.get("/users");
    return (response.data.data || []).map(u => ({
      id: u.id,
      namaLengkap: u.nama_lengkap,
      email: u.email,
      role: u.role,
      createdAt: u.created_at,
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const createUser = async (data) => {
  try {
    const response = await api.post("/users", {
      namaLengkap: data.namaLengkap,
      email: data.email,
      password: data.password,
      role: data.role,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const updateUserRole = async (id, role) => {
  try {
    const response = await api.put(`/users/${id}/role`, { role });
    return response.data;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};
