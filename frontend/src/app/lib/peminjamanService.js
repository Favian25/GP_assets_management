import api, { mapPeminjamanToFrontend, mapPeminjamanArrayToFrontend, mapPeminjamanToBackend } from "./api";

// 1. GET Semua Peminjaman
export const getAllPeminjaman = async () => {
  try {
    const response = await api.get("/peminjaman");
    return mapPeminjamanArrayToFrontend(response.data.data || []);
  } catch (error) {
    console.error("Error fetching peminjaman:", error);
    throw error;
  }
};

// 2. GET Peminjaman by ID
export const getPeminjamanById = async (id) => {
  try {
    const response = await api.get(`/peminjaman/${id}`);
    return mapPeminjamanToFrontend(response.data.data);
  } catch (error) {
    console.error(`Error fetching peminjaman with id ${id}:`, error);
    throw error;
  }
};

// 3. GET Kode Pinjam Berikutnya
export const getNextKodePinjam = async () => {
  try {
    const response = await api.get("/peminjaman/next-kode");
    return response.data.kode;
  } catch (error) {
    console.error("Error fetching next kode:", error);
    throw error;
  }
};

// 4. CREATE Peminjaman
export const createPeminjaman = async (data, files = []) => {
  try {
    const backendData = mapPeminjamanToBackend(data);
    
    if (files && files.length > 0) {
      const formData = new FormData();
      Object.keys(backendData).forEach(key => {
        if (key === "items") {
          formData.append(key, JSON.stringify(backendData[key]));
        } else {
          formData.append(key, backendData[key]);
        }
      });
      Array.from(files).forEach((file) => {
        formData.append("bukti", file);
      });
      const response = await api.post("/peminjaman", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    } else {
      const response = await api.post("/peminjaman", backendData);
      return response.data;
    }
  } catch (error) {
    console.error("Error creating peminjaman:", error);
    throw error;
  }
};

// 5. UPDATE Peminjaman (Pengembalian)
export const updatePeminjaman = async (id, data, files = []) => {
  try {
    const backendData = mapPeminjamanToBackend(data);
    
    if (files && files.length > 0) {
      const formData = new FormData();
      Object.keys(backendData).forEach(key => {
        formData.append(key, backendData[key]);
      });
      Array.from(files).forEach((file) => {
        formData.append("bukti", file);
      });
      const response = await api.put(`/peminjaman/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    } else {
      const response = await api.put(`/peminjaman/${id}`, backendData);
      return response.data;
    }
  } catch (error) {
    console.error(`Error updating peminjaman ${id}:`, error);
    throw error;
  }
};

// 6. APPROVE Peminjaman
export const approvePeminjaman = async (id, approvedBy) => {
  try {
    const response = await api.put(`/peminjaman/${id}/approve`, { approved_by: approvedBy });
    return response.data;
  } catch (error) {
    console.error(`Error approving peminjaman ${id}:`, error);
    throw error;
  }
};

// 7. DELETE Peminjaman
export const deletePeminjaman = async (id) => {
  try {
    const response = await api.delete(`/peminjaman/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting peminjaman ${id}:`, error);
    throw error;
  }
};

// 8. SEARCH Peminjaman
export const searchPeminjaman = async (keyword) => {
  try {
    const response = await api.get(`/peminjaman/search?q=${encodeURIComponent(keyword)}`);
    return mapPeminjamanArrayToFrontend(response.data.data || []);
  } catch (error) {
    console.error("Error searching peminjaman:", error);
    throw error;
  }
};
// 9. DOWNLOAD PDF Peminjaman
export const downloadPeminjamanPDF = async (id) => {
  try {
    const response = await api.get(`/peminjaman/${id}/pdf`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Peminjaman-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`Error downloading PDF for peminjaman ${id}:`, error);
    throw error;
  }
};
