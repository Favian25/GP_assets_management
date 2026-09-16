import api from "./api";

export const getAllUsers = async () => {
  try {
    const response = await api.get("/users");
    return (response.data.data || []).map(u => ({
      id: u.id,
      pegawaiId: u.pegawai_id,
      namaLengkap: u.nama_lengkap,
      email: u.email,
      role: u.role,
      fotoProfil: u.foto_profil,
      isActive: u.is_active !== undefined ? Boolean(u.is_active) : true,
      nomorHp: u.user_nomor_hp,
      keterangan: u.keterangan,
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
      pegawaiId: data.pegawaiId || null,
      nomorHp: data.nomorHp || null,
      keterangan: data.keterangan || null,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const updateUser = async (id, data) => {
  try {
    const response = await api.put(`/users/${id}`, {
      namaLengkap: data.namaLengkap,
      email: data.email,
      password: data.password || undefined,
      role: data.role,
      nomorHp: data.nomorHp || null,
      keterangan: data.keterangan || null,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
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

export const updateMyProfile = async (formData) => {
  try {
    const response = await api.put("/users/profile/me", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
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

// Toggle active/inactive user account
export const toggleUserActive = async (id) => {
  try {
    const response = await api.put(`/users/${id}/toggle-active`);
    return response.data;
  } catch (error) {
    console.error("Error toggling user active status:", error);
    throw error;
  }
};

// GET users by role (for dropdowns)
export const getUsersByRole = async (role) => {
  try {
    const response = await api.get(`/users/role/${role}`);
    return (response.data.data || []).map(u => ({
      id: u.id,
      pegawaiId: u.pegawai_id,
      namaLengkap: u.nama_lengkap,
      email: u.email,
      role: u.role,
      isActive: Boolean(u.is_active),
      nomorHp: u.nomor_hp,
    }));
  } catch (error) {
    console.error(`Error fetching users by role ${role}:`, error);
    throw error;
  }
};

// GET active users
export const getActiveUsers = async () => {
  try {
    const response = await api.get("/users/active");
    return (response.data.data || []).map(u => ({
      id: u.id,
      pegawaiId: u.pegawai_id,
      namaLengkap: u.nama_lengkap,
      email: u.email,
      role: u.role,
      fotoProfil: u.foto_profil,
      isActive: Boolean(u.is_active),
      nomorHp: u.nomor_hp,
    }));
  } catch (error) {
    console.error("Error fetching active users:", error);
    throw error;
  }
};

// GET users with pagination and optional role filter
export const getUsersWithPagination = async (page = 1, limit = 10, role = null) => {
  try {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);
    if (role) params.append("role", role);

    const response = await api.get(`/users/paginated?${params.toString()}`);
    return {
      data: (response.data.data || []).map(u => ({
        id: u.id,
        pegawaiId: u.pegawai_id,
        namaLengkap: u.nama_lengkap,
        email: u.email,
        role: u.role,
        fotoProfil: u.foto_profil,
        isActive: Boolean(u.is_active),
        nomorHp: u.nomor_hp,
        createdAt: u.created_at,
      })),
      total: response.data.total,
      page: response.data.page,
      limit: response.data.limit,
      totalPages: response.data.totalPages,
    };
  } catch (error) {
    console.error("Error fetching users with pagination:", error);
    throw error;
  }
};

// GET my profile
export const getMyProfile = async () => {
  try {
    const response = await api.get("/users/me");
    const data = response.data.data;
    return {
      id: data.id,
      pegawaiId: data.pegawai_id,
      namaLengkap: data.nama_lengkap,
      email: data.email,
      role: data.role,
      fotoProfil: data.foto_profil,
      isActive: Boolean(data.is_active),
      createdAt: data.created_at,
      pegawai: {
        nama: data.pegawai_nama,
        email: data.pegawai_email,
        tempatLahir: data.tempat_lahir,
        tanggalLahir: data.tanggal_lahir,
        alamat: data.alamat,
        nomorHp: data.nomor_hp,
      },
    };
  } catch (error) {
    console.error("Error fetching my profile:", error);
    throw error;
  }
};
