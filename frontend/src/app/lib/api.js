import axios from "axios";

// Axios instance dengan base URL backend
const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:5000/api`;
  }
  return "http://localhost:5000/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Interceptor: inject JWT token ke setiap request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
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
  jumlahTotal: "jumlah_total",
  hargaAset: "harga_aset",
  tanggalPembelian: "tanggal_pembelian",
  userId: "user_id",
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

  // Preserve timestamps & special fields jika ada
  if (backendAsset.created_at) mapped.createdAt = backendAsset.created_at;
  if (backendAsset.updated_at) mapped.updatedAt = backendAsset.updated_at;
  if (backendAsset.created_by_name) mapped.createdByName = backendAsset.created_by_name;

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
    returnApprovedBy: backendData.return_approved_by,
    totalItems: backendData.total_items,
    daftarAset: backendData.daftar_aset,
    buktiPeminjaman: backendData.bukti_peminjaman,
    buktiPengembalian: backendData.bukti_pengembalian,
    userId: backendData.user_id,
    createdByName: backendData.created_by_name,
    createdAt: backendData.created_at,
    // Items (jika ada dari getById)
    items: backendData.items
      ? backendData.items.map((item) => ({
          id: item.id,
          assetId: item.asset_id,
          aksesorisId: item.aksesoris_id,
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
  if (frontendData.buktiPeminjaman !== undefined) mapped.bukti_peminjaman = frontendData.buktiPeminjaman;
  if (frontendData.buktiPengembalian !== undefined) mapped.bukti_pengembalian = frontendData.buktiPengembalian;
  // Items
  if (frontendData.items) {
    mapped.items = frontendData.items.map((item) => ({
      asset_id: item.assetId || null,
      aksesoris_id: item.aksesorisId || null,
      jumlah: item.jumlah,
    }));
  }
  return mapped;
}

export function mapPeminjamanArrayToFrontend(backendArray) {
  if (!Array.isArray(backendArray)) return [];
  return backendArray.map(mapPeminjamanToFrontend);
}

// ============================================================
// Utility mapping untuk Aksesoris
// ============================================================

const aksesorisFieldMapToBackend = {
  kodeAksesoris: "kode_aksesoris",
  namaAksesoris: "nama_aksesoris",
  kategori: "kategori",
  merek: "merek",
  model: "model",
  jumlahUnit: "jumlah_unit",
  jumlahTotal: "jumlah_total",
  hargaAset: "harga_aset",
  tanggalPembelian: "tanggal_pembelian",
  kondisi: "kondisi",
  lokasi: "lokasi",
  gambar: "gambar",
  keterangan: "keterangan",
  userId: "user_id",
};

const aksesorisFieldMapToFrontend = Object.fromEntries(
  Object.entries(aksesorisFieldMapToBackend).map(([fe, be]) => [be, fe])
);

export function mapAksesorisToFrontend(backendItem) {
  if (!backendItem) return null;
  const mapped = { id: backendItem.id };
  for (const [beKey, feKey] of Object.entries(aksesorisFieldMapToFrontend)) {
    if (beKey in backendItem) mapped[feKey] = backendItem[beKey];
  }
  if (backendItem.created_at) mapped.createdAt = backendItem.created_at;
  if (backendItem.updated_at) mapped.updatedAt = backendItem.updated_at;
  if (backendItem.created_by_name) mapped.createdByName = backendItem.created_by_name;
  return mapped;
}

export function mapAksesorisToBackend(frontendItem) {
  if (!frontendItem) return null;
  const mapped = {};
  for (const [feKey, beKey] of Object.entries(aksesorisFieldMapToBackend)) {
    if (feKey in frontendItem) mapped[beKey] = frontendItem[feKey];
  }
  return mapped;
}

export function mapAksesorisArrayToFrontend(backendArray) {
  if (!Array.isArray(backendArray)) return [];
  return backendArray.map(mapAksesorisToFrontend);
}

export function mapAuditLogToFrontend(log) {
  if (!log) return null;
  return {
    id: log.id,
    userId: log.user_id,
    userName: log.user_name,
    action: log.action,
    entityType: log.entity_type,
    entityId: log.entity_id,
    details: log.details,
    createdAt: log.created_at
  };
}

export function mapAuditLogArrayToFrontend(logs) {
  if (!Array.isArray(logs)) return [];
  return logs.map(mapAuditLogToFrontend);
}

export default api;
