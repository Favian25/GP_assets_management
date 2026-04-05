import axios from "axios";

// Axios instance dengan base URL backend
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ============================================================
// Utility: Mapping field names antara Frontend ↔ Backend
// Frontend pakai camelCase, Backend pakai snake_case
// ============================================================

// Mapping: Frontend key → Backend key (ASET)
const fieldMapToBackend = {
  kodeAset: "kode_aset",
  namaAset: "nama_aset",
  pengguna: "pengguna",
  kategori: "kategori",
  merek: "merek",
  model: "model",
  noSN: "no_sn",
  spesifikasi: "spesifikasi",
  lokasiAset: "lokasi_aset",
  kondisi: "kondisi",
  unit: "unit",
  gambar: "gambar",
  keterangan: "keterangan",
  jumlah: "jumlah",
  hargaAset: "harga_aset",
};

// Mapping: Backend key → Frontend key (reverse)
const fieldMapToFrontend = Object.fromEntries(
  Object.entries(fieldMapToBackend).map(([fe, be]) => [be, fe])
);

/**
 * Konversi satu objek aset dari format Backend → Frontend (camelCase)
 */
export function mapAssetToFrontend(backendAsset) {
  if (!backendAsset) return null;

  const mapped = {
    id: backendAsset.id,
  };

  for (const [beKey, feKey] of Object.entries(fieldMapToFrontend)) {
    if (beKey in backendAsset) {
      mapped[feKey] = backendAsset[beKey];
    }
  }

  // Preserve timestamps jika ada
  if (backendAsset.created_at) mapped.createdAt = backendAsset.created_at;
  if (backendAsset.updated_at) mapped.updatedAt = backendAsset.updated_at;

  return mapped;
}

/**
 * Konversi satu objek aset dari format Frontend → Backend (snake_case)
 */
export function mapAssetToBackend(frontendAsset) {
  if (!frontendAsset) return null;

  const mapped = {};

  for (const [feKey, beKey] of Object.entries(fieldMapToBackend)) {
    if (feKey in frontendAsset) {
      mapped[beKey] = frontendAsset[feKey];
    }
  }

  return mapped;
}

/**
 * Konversi array aset dari Backend → Frontend
 */
export function mapAssetsToFrontend(backendAssets) {
  if (!Array.isArray(backendAssets)) return [];
  return backendAssets.map(mapAssetToFrontend);
}

// ============================================================
// Utility mapping untuk Peminjaman (Header)
// ============================================================

export function mapPeminjamanToFrontend(backendData) {
  if (!backendData) return null;
  return {
    id: backendData.id,
    kodePinjam: backendData.kode_pinjam,
    namaPeminjam: backendData.nama_peminjam,
    penerimaAset: backendData.penerima_aset,
    alasanPeminjaman: backendData.alasan_peminjaman,
    tanggalPeminjaman: backendData.tanggal_peminjaman,
    tanggalPengembalian: backendData.tanggal_pengembalian,
    status: backendData.status,
    yangMenyerahkan: backendData.yang_menyerahkan,
    approvedBy: backendData.approved_by,
    totalItems: backendData.total_items,
    daftarAset: backendData.daftar_aset,
    createdAt: backendData.created_at,
    // Items (jika ada dari getById)
    items: backendData.items
      ? backendData.items.map((item) => ({
          id: item.id,
          assetId: item.asset_id,
          namaAset: item.nama_aset,
          kodeAset: item.kode_aset,
          jumlah: item.jumlah,
          stokTersedia: item.stok_tersedia,
        }))
      : undefined,
  };
}

export function mapPeminjamanToBackend(frontendData) {
  if (!frontendData) return null;
  const mapped = {};
  if (frontendData.namaPeminjam !== undefined) mapped.nama_peminjam = frontendData.namaPeminjam;
  if (frontendData.penerimaAset !== undefined) mapped.penerima_aset = frontendData.penerimaAset;
  if (frontendData.alasanPeminjaman !== undefined) mapped.alasan_peminjaman = frontendData.alasanPeminjaman;
  if (frontendData.tanggalPeminjaman !== undefined) mapped.tanggal_peminjaman = frontendData.tanggalPeminjaman;
  if (frontendData.tanggalPengembalian !== undefined) mapped.tanggal_pengembalian = frontendData.tanggalPengembalian;
  if (frontendData.status !== undefined) mapped.status = frontendData.status;
  if (frontendData.yangMenyerahkan !== undefined) mapped.yang_menyerahkan = frontendData.yangMenyerahkan;
  if (frontendData.approvedBy !== undefined) mapped.approved_by = frontendData.approvedBy;
  // Items
  if (frontendData.items) {
    mapped.items = frontendData.items.map((item) => ({
      asset_id: item.assetId,
      jumlah: item.jumlah,
    }));
  }
  return mapped;
}

export function mapPeminjamanArrayToFrontend(backendArray) {
  if (!Array.isArray(backendArray)) return [];
  return backendArray.map(mapPeminjamanToFrontend);
}

export default api;
