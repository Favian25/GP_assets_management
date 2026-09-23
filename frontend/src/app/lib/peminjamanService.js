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
        if (key === "items" || key === "keperluan_list") {
          formData.append(key, JSON.stringify(backendData[key]));
        } else {
          formData.append(key, backendData[key] || "");
        }
      });
      Array.from(files).forEach((file) => {
        formData.append("bukti", file);
      });
      const response = await api.post("/peminjaman", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } else {
      const response = await api.post("/peminjaman", backendData);
      return response.data;
    }
  } catch (error) {
    console.error("Error creating peminjaman:", error);
    if (error.response?.data?.message) {
      console.error("Backend error message:", error.response.data.message);
    }
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
        headers: { "Content-Type": "multipart/form-data" },
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
export const approvePeminjaman = async (id, approvedBy, yangMenyerahkan = null, penerimaAset = null) => {
  try {
    const response = await api.put(`/peminjaman/${id}/approve`, {
      approved_by: approvedBy,
      yang_menyerahkan: yangMenyerahkan || null,
      penerima_aset: penerimaAset || null
    });
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
// 9. DOWNLOAD PDF Peminjaman (via Client-side Print)
export const downloadPeminjamanPDF = async (id) => {
  try {
    const response = await api.get(`/peminjaman/${id}/pdf`, { responseType: "text" });
    
    // Buka tab/jendela baru
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error("Pop-up diblokir oleh browser. Harap izinkan pop-up untuk situs ini.");
    }
    
    // Tulis HTML dari backend ke tab baru
    printWindow.document.open();
    printWindow.document.write(response.data);
    printWindow.document.close();
    
    // Note: Script window.print() sudah disematkan di dalam HTML dari backend
  } catch (error) {
    console.error(`Error processing print layout for peminjaman ${id}:`, error);
    throw error;
  }
};

// 10. SWAP item saat Sedang Dipinjam (tukar barang)
export const swapPeminjamanItem = async (id, data) => {
  try {
    const response = await api.put(`/peminjaman/${id}/swap-item`, {
      old_item_id: data.oldItemId,
      old_item_type: data.oldItemType,
      new_item_id: data.newItemId,
      new_item_type: data.newItemType,
      jumlah: data.jumlah,
    });
    return response.data;
  } catch (error) {
    console.error(`Error swapping item for peminjaman ${id}:`, error);
    throw error;
  }
};

// 11. ADD item tambahan saat Sedang Dipinjam
export const addItemToPeminjaman = async (id, data) => {
  try {
    const response = await api.put(`/peminjaman/${id}/add-item`, {
      item_id: data.itemId,
      item_type: data.itemType,
      jumlah: data.jumlah,
    });
    return response.data;
  } catch (error) {
    console.error(`Error adding item to peminjaman ${id}:`, error);
    throw error;
  }
};

// 12. GET riwayat peminjaman milik user sendiri
export const getMyPeminjamanHistory = async () => {
  try {
    const response = await api.get("/peminjaman/my-history");
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching my peminjaman history:", error);
    throw error;
  }
};

// 13. GET peminjaman by status
export const getPeminjamanByStatus = async (status) => {
  try {
    const response = await api.get(`/peminjaman/status/${status}`);
    return mapPeminjamanArrayToFrontend(response.data.data || []);
  } catch (error) {
    console.error(`Error fetching peminjaman by status ${status}:`, error);
    throw error;
  }
};

// 14. GET peminjaman by nama peminjam (for borrowing history by pegawai)
export const getPeminjamanByNamaPeminjam = async (namaPeminjam) => {
  try {
    const response = await api.get(`/peminjaman/nama/${encodeURIComponent(namaPeminjam)}`);
    return mapPeminjamanArrayToFrontend(response.data.data || []);
  } catch (error) {
    console.error(`Error fetching peminjaman by nama ${namaPeminjam}:`, error);
    throw error;
  }
};

// 15. GET items dengan pricing
export const getItemsWithPricing = async (id) => {
  try {
    const response = await api.get(`/peminjaman/${id}/items-pricing`);
    return response.data.data || [];
  } catch (error) {
    console.error(`Error fetching items with pricing for peminjaman ${id}:`, error);
    throw error;
  }
};
