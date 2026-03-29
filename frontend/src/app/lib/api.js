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

// Mapping: Frontend key → Backend key
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

export default api;
