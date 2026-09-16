import api from "./api";

// GET semua pegawai (untuk dropdown)
export const getAllPegawai = async () => {
  try {
    const response = await api.get("/pegawai");
    return (response.data.data || []).map((p) => ({
      id: p.id,
      namaLengkap: p.nama_lengkap,
      tempatLahir: p.tempat_lahir,
      tanggalLahir: p.tanggal_lahir,
      alamat: p.alamat,
      email: p.email,
      nomorHp: p.nomor_hp,
    }));
  } catch (error) {
    console.error("Error fetching pegawai:", error);
    throw error;
  }
};

// GET pegawai by ID
export const getPegawaiById = async (id) => {
  try {
    const response = await api.get(`/pegawai/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching pegawai ${id}:`, error);
    throw error;
  }
};

// CREATE pegawai
export const createPegawai = async (data) => {
  try {
    const response = await api.post("/pegawai", {
      nama_lengkap: data.namaLengkap,
      tempat_lahir: data.tempatLahir || null,
      tanggal_lahir: data.tanggalLahir || null,
      alamat: data.alamat || null,
      email: data.email || null,
      nomor_hp: data.nomorHp || null,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating pegawai:", error);
    throw error;
  }
};

// UPDATE pegawai
export const updatePegawai = async (id, data) => {
  try {
    const response = await api.put(`/pegawai/${id}`, {
      nama_lengkap: data.namaLengkap,
      tempat_lahir: data.tempatLahir,
      tanggal_lahir: data.tanggalLahir,
      alamat: data.alamat,
      email: data.email,
      nomor_hp: data.nomorHp,
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating pegawai ${id}:`, error);
    throw error;
  }
};

// DELETE pegawai
export const deletePegawai = async (id) => {
  try {
    const response = await api.delete(`/pegawai/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting pegawai ${id}:`, error);
    throw error;
  }
};

// GET approvers (supervisor, admin, super admin - untuk yang_menyerahkan dropdown)
export const getApprovers = async () => {
  try {
    const response = await api.get("/pegawai/approvers");
    return (response.data.data || []).map((p) => ({
      id: p.id,
      namaLengkap: p.nama_lengkap,
      email: p.email,
      nomorHp: p.nomor_hp,
      role: p.role,
    }));
  } catch (error) {
    console.error("Error fetching approvers:", error);
    throw error;
  }
};

// GET active pegawai (untuk nama_peminjam dropdown)
export const getActivePegawai = async () => {
  try {
    const response = await api.get("/pegawai/active");
    return (response.data.data || []).map((p) => ({
      id: p.id,
      namaLengkap: p.nama_lengkap,
      email: p.email,
      nomorHp: p.nomor_hp,
      role: p.role,
    }));
  } catch (error) {
    console.error("Error fetching active pegawai:", error);
    throw error;
  }
};

// GET pegawai by role
export const getPegawaiByRole = async (role) => {
  try {
    const response = await api.get(`/pegawai/role/${role}`);
    return (response.data.data || []).map((p) => ({
      id: p.id,
      namaLengkap: p.nama_lengkap,
      email: p.email,
      nomorHp: p.nomor_hp,
      role: p.role,
    }));
  } catch (error) {
    console.error(`Error fetching pegawai by role ${role}:`, error);
    throw error;
  }
};

// GET pegawai with user status
export const getPegawaiWithUserStatus = async () => {
  try {
    const response = await api.get("/pegawai/with-user-status");
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching pegawai with user status:", error);
    throw error;
  }
};
