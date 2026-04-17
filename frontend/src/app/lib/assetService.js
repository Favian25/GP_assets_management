import api, {
  mapAssetToFrontend,
  mapAssetToBackend,
  mapAssetsToFrontend,
} from "./api";
import { getAllPeminjaman } from "./peminjamanService";

// ============================================================
// Asset Service — Semua operasi CRUD & Search terhadap API
// ============================================================

/**
 * GET semua aset
 * @returns {Promise<Array>} list aset dalam format camelCase
 */
export async function getAllAssets() {
  const response = await api.get("/assets");
  return mapAssetsToFrontend(response.data.data);
}

/**
 * GET aset berdasarkan ID
 * @param {number} id
 * @returns {Promise<Object>} aset dalam format camelCase
 */
export async function getAssetById(id) {
  const response = await api.get(`/assets/${id}`);
  return mapAssetToFrontend(response.data.data);
}

/**
 * POST buat aset baru
 * @param {Object} assetData - data aset dalam format camelCase
 * @param {File|null} imageFile - file gambar (opsional)
 * @returns {Promise<Object>} aset yang baru dibuat
 */
export async function createAsset(assetData, imageFile = null) {
  const backendData = mapAssetToBackend(assetData);

  // Gunakan FormData jika ada file upload
  if (imageFile) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(backendData)) {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    }
    formData.append("gambar", imageFile);

    const response = await api.post("/assets", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return mapAssetToFrontend(response.data.data);
  }

  const response = await api.post("/assets", backendData);
  return mapAssetToFrontend(response.data.data);
}

/**
 * PUT update aset
 * @param {number} id
 * @param {Object} assetData - data aset dalam format camelCase
 * @param {File|null} imageFile - file gambar baru (opsional)
 * @returns {Promise<Object>} aset yang sudah diupdate
 */
export async function updateAsset(id, assetData, imageFile = null) {
  const backendData = mapAssetToBackend(assetData);

  if (imageFile) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(backendData)) {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    }
    formData.append("gambar", imageFile);

    const response = await api.put(`/assets/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return mapAssetToFrontend(response.data.data);
  }

  const response = await api.put(`/assets/${id}`, backendData);
  return mapAssetToFrontend(response.data.data);
}

/**
 * DELETE hapus aset
 * @param {number} id
 * @returns {Promise<Object>} response message
 */
export async function deleteAsset(id) {
  const response = await api.delete(`/assets/${id}`);
  return response.data;
}

/**
 * PATCH update kondisi aset
 * @param {number} id
 * @param {string} kondisi
 * @returns {Promise<Object>} response message
 */
export async function updateAssetKondisi(id, kondisi) {
  const response = await api.patch(`/assets/${id}/kondisi`, { kondisi });
  return response.data;
}

/**
 * SEARCH cari aset berdasarkan keyword
 * @param {string} keyword
 * @returns {Promise<Array>} list aset yang ditemukan
 */
export async function searchAssets(keyword) {
  const response = await api.get("/assets/search", {
    params: { q: keyword },
  });
  return mapAssetsToFrontend(response.data.data);
}

/**
 * GET statistik dashboard
 * Fetch semua aset lalu hitung statistik
 * @returns {Promise<Object>} stats
 */
export async function getDashboardStats() {
  const assets = await getAllAssets();
  const peminjaman = await getAllPeminjaman();
  
  const total = assets.length;
  const tersedia = assets.filter((a) => a.kondisi === "Siap Digunakan").length;
  const maintenance = assets.filter((a) => a.kondisi === "Maintenance").length;
  const rusak = assets.filter((a) => a.kondisi === "Rusak").length;
  const dijual = assets.filter((a) => a.kondisi === "Dijual").length;
  
  // Hitung jumlah peminjaman yang sedang dipinjam (Pending)
  const dipinjam = peminjaman.filter((p) => p.status === "Pending").length;

  return {
    total,
    tersedia,
    maintenance,
    rusak,
    diarsipkan: dijual,
    dipinjam,
    recentAssets: assets.slice(0, 5),
  };
}
