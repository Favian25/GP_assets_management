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
export async function updateAssetKondisi(id, dataOrKondisi) {
  const payload = typeof dataOrKondisi === "string" ? { kondisi: dataOrKondisi } : dataOrKondisi;
  const response = await api.patch(`/assets/${id}/kondisi`, payload);
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
  
  // ── Peminjaman Aktif (Sedang Dipinjam / Menunggu Verifikasi) ──
  const activeLoans = peminjaman
    .filter(p => p.status === 'Sedang Dipinjam' || p.status === 'Menunggu Verifikasi')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // ── Total Aset: jumlah keseluruhan unit aset KECUALI yang kondisinya "Dijual" atau "Rusak Berat" ──
  const totalAset = assets
    .filter(a => a.kondisi !== "Dijual" && a.kondisi !== "Rusak Berat")
    .reduce((sum, a) => sum + (a.totalUnitsCount !== undefined ? Number(a.totalUnitsCount) : (parseInt(a.jumlahTotal) || parseInt(a.jumlah) || 0)), 0);

  // ── Aksesoris: jumlah unit aksesoris KECUALI "Dijual" atau "Rusak Berat" ──
  const totalAksesoris = aksesoris
    .filter(a => a.kondisi !== "Dijual" && a.kondisi !== "Rusak Berat")
    .reduce((sum, a) => sum + (parseInt(a.jumlahTotal) || parseInt(a.jumlahUnit) || 0), 0);

  // ── Siap Digunakan: unit aset yang siap digunakan dan tersedia ──
  const tersedia = assets
    .filter(a => a.kondisi !== "Dijual" && a.kondisi !== "Rusak Berat")
    .reduce((sum, a) => {
      if (a.readyUnitsCount !== undefined) {
        return sum + Number(a.readyUnitsCount);
      }
      return a.kondisi === "Siap Digunakan" ? sum + (parseInt(a.jumlah) || 0) : sum;
    }, 0);

  // ── Rusak: jumlah unit fisik yang berkondisi "Rusak" ──
  const rusak = assets
    .filter(a => a.kondisi !== "Dijual")
    .reduce((sum, a) => {
      if (a.rusakUnitsCount !== undefined) {
        return sum + Number(a.rusakUnitsCount) + Number(a.rusakBeratUnitsCount || 0);
      }
      return (a.kondisi === "Rusak" || a.kondisi === "Rusak Berat") ? sum + (parseInt(a.jumlahTotal) || parseInt(a.jumlah) || 0) : sum;
    }, 0);

  // ── Maintenance: jumlah unit fisik yang berkondisi "Maintenance" ──
  const maintenance = assets
    .filter(a => a.kondisi !== "Dijual" && a.kondisi !== "Rusak Berat")
    .reduce((sum, a) => {
      if (a.maintenanceUnitsCount !== undefined) {
        return sum + Number(a.maintenanceUnitsCount);
      }
      return a.kondisi === "Maintenance" ? sum + (parseInt(a.jumlahTotal) || parseInt(a.jumlah) || 0) : sum;
    }, 0);

  // ── Dipinjam Aset: HANYA jika ada peminjaman aktif riil (status 'Sedang Dipinjam' / 'Menunggu Verifikasi') ──
  const dipinjamAsetFromLoans = activeLoans.reduce((sum, p) => sum + (parseInt(p.totalAsetPinjam) || 0), 0);
  const dipinjamUnitsFromAssets = assets.reduce((sum, a) => sum + (parseInt(a.dipinjamUnitsCount) || 0), 0);
  const dipinjamAset = activeLoans.length > 0
    ? Math.max(dipinjamAsetFromLoans, dipinjamUnitsFromAssets)
    : 0;

  // ── Dipinjam Aksesoris: HANYA jika ada peminjaman aktif riil ──
  const dipinjamAksesoris = activeLoans.length > 0
    ? activeLoans.reduce((sum, p) => sum + (parseInt(p.totalAksesorisPinjam) || 0), 0)
    : 0;

  const aksesorisRusak = aksesoris
    .filter(a => a.kondisi === "Rusak" || a.kondisi === "Rusak Berat")
    .reduce((sum, a) => sum + (parseInt(a.jumlahTotal) || parseInt(a.jumlahUnit) || 0), 0);

  const aksesorisMaintenance = aksesoris
    .filter(a => a.kondisi === "Maintenance")
    .reduce((sum, a) => sum + (parseInt(a.jumlahTotal) || parseInt(a.jumlahUnit) || 0), 0);

  const dipinjam = dipinjamAset + dipinjamAksesoris;

  // ── Aksesoris Tersedia (pie chart): hanya yang kondisi "Siap Digunakan" dikurangi yang dipinjam ──
  const aksesorisTersediaCount = Math.max(
    0,
    aksesoris
      .filter(a => a.kondisi === "Siap Digunakan")
      .reduce((sum, a) => sum + (parseInt(a.jumlahUnit) || 0), 0) - dipinjamAksesoris
  );

  // ── Total Nilai Aset: periksa tipeHarga ('Per Paket' = hargaAset, 'Per Unit' = hargaAset × jumlahTotal) ──
  const totalNilaiAset = assets
    .filter(a => a.kondisi !== "Dijual" && a.kondisi !== "Rusak Berat")
    .reduce((sum, a) => {
      const harga = parseInt(a.hargaAset) || 0;
      const total = parseInt(a.jumlahTotal) || 0;
      return sum + (a.tipeHarga === "Per Paket" ? harga : harga * total);
    }, 0);

  // ── Total Nilai Aksesoris: periksa tipeHarga ('Per Paket' = hargaAset, 'Per Unit' = hargaAset × jumlahTotal) ──
  const totalNilaiAksesoris = aksesoris
    .filter(a => a.kondisi !== "Dijual" && a.kondisi !== "Rusak Berat")
    .reduce((sum, a) => {
      const harga = parseInt(a.hargaAset) || 0;
      const total = parseInt(a.jumlahTotal) || 0;
      return sum + (a.tipeHarga === "Per Paket" ? harga : harga * total);
    }, 0);

  // Peringatan Stok Rendah (jumlah <= 3)
  const lowStockAssets = [
    ...assets.filter(a => (parseInt(a.jumlah) || 0) <= 3),
    ...aksesoris.filter(a => (parseInt(a.jumlahUnit) || 0) <= 3)
  ];

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
    total: totalAset,
    aksesorisTotal: totalAksesoris,
    totalNilaiAset,
    totalNilaiAksesoris,
    totalNilaiKeseluruhan: totalNilaiAset + totalNilaiAksesoris,
    tersedia,
    maintenance,
    rusak,
    dipinjam,
    asetDipinjam: dipinjamAset,
    aksesorisTersedia: aksesorisTersediaCount,
    aksesorisDipinjam: dipinjamAksesoris,
    aksesorisMaintenance,
    aksesorisRusak,
    activities,
    lowStockAssets,
    activeLoans,
    recentAssets: assets.slice(0, 5),
  };
}

/**
 * POST import massal aset dari data Excel
 * @param {Array} items - array of asset objects
 * @returns {Promise<Object>} hasil import
 */
export async function importAssets(items) {
  const response = await api.post("/assets/import", { items });
  return response.data;
}

/**
 * DELETE seluruh aset dan/atau aksesoris (Khusus Super Admin)
 * @param {"both"|"assets"|"accessories"} target
 * @returns {Promise<Object>} hasil penghapusan
 */
export async function deleteAllInventory(target = "both") {
  const response = await api.delete("/assets/bulk/delete-all", {
    data: { target }
  });
  return response.data;
}

/**
 * GET semua unit fisik dari sebuah aset
 * @param {number} assetId
 * @returns {Promise<Array>} list unit
 */
export async function getAssetUnits(assetId) {
  const response = await api.get(`/assets/${assetId}/units`);
  return response.data.data;
}

/**
 * POST tambah unit fisik baru pada aset
 * @param {number} assetId
 * @param {Object} unitData
 * @returns {Promise<Object>} unit yang dibuat
 */
export async function addAssetUnit(assetId, unitData) {
  const response = await api.post(`/assets/${assetId}/units`, unitData);
  return response.data;
}

/**
 * PUT update unit fisik tertentu (kondisi, no_sn, nama_unit, lokasi, dll)
 * @param {number} unitId
 * @param {Object} unitData
 * @returns {Promise<Object>} hasil update
 */
export async function updateAssetUnit(unitId, unitData) {
  const response = await api.put(`/assets/units/${unitId}`, unitData);
  return response.data;
}

/**
 * DELETE hapus unit fisik tertentu
 * @param {number} unitId
 * @returns {Promise<Object>} hasil delete
 */
export async function deleteAssetUnit(unitId) {
  const response = await api.delete(`/assets/units/${unitId}`);
  return response.data;
}


