import api, {
  mapAssetToFrontend,
  mapAssetToBackend,
  mapAssetsToFrontend,
} from "./api";
import { getAllPeminjaman } from "./peminjamanService";
import { getAllAksesoris } from "./aksesorisService";

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
  const aksesoris = await getAllAksesoris();
  const peminjaman = await getAllPeminjaman();
  
  // Hitung statistik aset
  const assetTotal = assets.length;
  const assetTersedia = assets.filter((a) => a.kondisi === "Siap Digunakan").length;
  const assetMaintenance = assets.filter((a) => a.kondisi === "Maintenance").length;
  const assetRusak = assets.filter((a) => a.kondisi === "Rusak").length;
  const assetDijual = assets.filter((a) => a.kondisi === "Dijual").length;
  
  // Hitung statistik aksesoris
  const aksTotal = aksesoris.length;
  const aksTersedia = aksesoris.filter((a) => a.kondisi === "Siap Digunakan").length;
  const aksMaintenance = aksesoris.filter((a) => a.kondisi === "Maintenance").length;
  const aksRusak = aksesoris.filter((a) => a.kondisi === "Rusak").length;

  // Gabungkan total
  const total = assetTotal + aksTotal;
  const tersedia = assetTersedia + aksTersedia;
  const maintenance = assetMaintenance + aksMaintenance;
  const rusak = assetRusak + aksRusak;
  
  // Hitung jumlah unit yang sedang dipinjam (total - tersedia)
  const assetDipinjam = assets.reduce((sum, a) => {
    const t = parseInt(a.jumlahTotal) || 0;
    const r = parseInt(a.jumlah) || 0;
    return sum + (t - r);
  }, 0);

  const aksDipinjam = aksesoris.reduce((sum, a) => {
    const t = parseInt(a.jumlahTotal) || 0;
    const r = parseInt(a.jumlahUnit) || 0;
    return sum + (t - r);
  }, 0);

  const dipinjam = assetDipinjam + aksDipinjam;

  // Peringatan Stok Rendah (jumlah <= 3)
  const lowStockAssets = [
    ...assets.filter(a => (parseInt(a.jumlah) || 0) <= 3),
    ...aksesoris.filter(a => (parseInt(a.jumlahUnit) || 0) <= 3)
  ];

  // Peminjaman Aktif (belum selesai)
  const activeLoans = peminjaman
    .filter(p => p.status !== 'Peminjaman Selesai')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Aktivitas Terbaru (Gabungan Asset, Aksesoris & Peminjaman)
  const activities = [
    ...assets.map(a => ({
      id: `asset-${a.id}`,
      date: a.createdAt,
      createdBy: a.createdByName || "Admin",
      action: "Tambah Aset",
      item: a.namaAset,
      target: "-",
      type: "asset"
    })),
    ...aksesoris.map(a => ({
      id: `aks-${a.id}`,
      date: a.createdAt,
      createdBy: a.createdByName || "Admin",
      action: "Tambah Aksesoris",
      item: a.namaAksesoris,
      target: "-",
      type: "aksesoris"
    })),
    ...peminjaman.map(p => ({
      id: `pjm-${p.id}`,
      date: p.createdAt,
      createdBy: p.createdByName || "User",
      action: (p.status === 'Menunggu Persetujuan' || p.status === 'Sedang Dipinjam') ? 'Peminjaman' : 'Pengembalian',
      item: p.kodePinjam,
      target: p.namaPeminjam,
      type: "loan"
    }))
  ]
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .slice(0, 25);

  return {
    total,
    tersedia,
    maintenance,
    rusak,
    diarsipkan: assetDijual,
    dipinjam,
    activities,
    lowStockAssets,
    activeLoans,
    recentAssets: assets.slice(0, 5),
  };
}
