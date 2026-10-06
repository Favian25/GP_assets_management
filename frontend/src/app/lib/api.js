import axios from "axios";

// Axios instance tanpa base URL - URL akan di-construct di interceptor
const api = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: construct full URL & inject JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // Construct full URL dynamically
    const baseHost = window.location.hostname;
    const basePort = "5000";
    config.url = `http://${baseHost}:${basePort}/api${config.url}`;

    // Inject token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else {
    // Server side fallback
    if (!config.url.startsWith("http")) {
      config.url = `http://localhost:5000/api${config.url}`;
    }
  }
  return config;
});

// Response interceptor: auto-logout jika akun dinonaktifkan
let isDeactivatedModalShown = false; // Cegah duplikasi modal
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 403 &&
      error.response.data?.code === "ACCOUNT_DEACTIVATED"
    ) {
      if (typeof window !== "undefined" && !isDeactivatedModalShown) {
        isDeactivatedModalShown = true;

        // Hapus semua data auth
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("loginAt");

        // Buat overlay modal dengan desain UI yang sesuai project
        const overlay = document.createElement("div");
        overlay.style.cssText = `
          position: fixed; inset: 0; z-index: 99999;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
          animation: fadeIn 0.3s ease;
          padding: 16px;
        `;

        overlay.innerHTML = `
          <style>
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
          </style>
          <div style="
            background: white; border-radius: 16px; padding: 32px;
            max-width: 400px; width: 100%;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
            animation: slideUp 0.3s ease;
            text-align: center;
          ">
            <div style="
              width: 56px; height: 56px; border-radius: 50%;
              background: #FEE2E2; margin: 0 auto 16px;
              display: flex; align-items: center; justify-content: center;
            ">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3 style="
              font-size: 18px; font-weight: 700; color: #1E293B;
              margin: 0 0 8px;
            ">Akun Dinonaktifkan</h3>
            <p style="
              font-size: 14px; color: #64748B; line-height: 1.6;
              margin: 0 0 24px;
            ">
              Akun Anda telah dinonaktifkan oleh admin. Silakan hubungi admin untuk informasi lebih lanjut.
            </p>
            <button id="deactivated-logout-btn" style="
              width: 100%; padding: 10px 20px;
              background: #EF4444; color: white;
              border: none; border-radius: 10px;
              font-size: 14px; font-weight: 600;
              cursor: pointer; transition: background 0.2s;
            " onmouseover="this.style.background='#DC2626'"
               onmouseout="this.style.background='#EF4444'">
              Kembali ke Halaman Login
            </button>
          </div>
        `;

        document.body.appendChild(overlay);

        // Redirect saat tombol diklik
        document.getElementById("deactivated-logout-btn").addEventListener("click", () => {
          window.location.href = "/login";
        });
      }
    }
    return Promise.reject(error);
  }
);

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
  jenisAset: "jenis_aset",
  kondisi: "kondisi",
  unit: "unit",
  gambar: "gambar",
  keterangan: "keterangan",
  jumlah: "jumlah",
  jumlahTotal: "jumlah_total",
  hargaAset: "harga_aset",
  tanggalPembelian: "tanggal_pembelian",
  userId: "user_id",
  jenisAset: "jenis_aset",
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
    // Keperluan list (bisa berupa string JSON atau array)
    keperluanList: (() => {
      const raw = backendData.keperluan_list;
      if (!raw) return null;
      if (Array.isArray(raw)) return raw;
      if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return null; }
      }
      return null;
    })(),
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
  if (frontendData.keperluanList !== undefined) mapped.keperluan_list = frontendData.keperluanList;
  if (frontendData.tanggalPeminjaman !== undefined) mapped.tanggal_peminjaman = frontendData.tanggalPeminjaman;
  if (frontendData.tanggalPengembalian !== undefined) mapped.tanggal_pengembalian = frontendData.tanggalPengembalian;
  if (frontendData.status !== undefined) mapped.status = frontendData.status;
  // Jangan include yang_menyerahkan saat create, hanya saat approve
  if (frontendData.yangMenyerahkan !== undefined && frontendData.yangMenyerahkan !== null) mapped.yang_menyerahkan = frontendData.yangMenyerahkan;
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
  jenisAset: "jenis_aset",
  kondisi: "kondisi",
  lokasi: "lokasi",
  gambar: "gambar",
  keterangan: "keterangan",
  userId: "user_id",
  jenisAset: "jenis_aset",
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
    entityName: log.entity_name,
    details: log.details,
    createdAt: log.created_at
  };
}

export function mapAuditLogArrayToFrontend(logs) {
  if (!Array.isArray(logs)) return [];
  return logs.map(mapAuditLogToFrontend);
}

export default api;
