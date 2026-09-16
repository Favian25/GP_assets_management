"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { getMyPeminjamanHistory } from "../lib/peminjamanService";
import { getUserContext } from "../lib/authService";
import { History, Eye, Package, Clock, CheckCircle2, AlertCircle, RotateCcw, Search } from "lucide-react";

const getStatusBadge = (status) => {
  const s = {
    "Menunggu Persetujuan": "bg-amber-50 text-amber-700 border-amber-200",
    "Sedang Dipinjam": "bg-blue-50 text-blue-700 border-blue-200",
    "Menunggu Verifikasi": "bg-violet-50 text-violet-700 border-violet-200",
    "Peminjaman Selesai": "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return s[status] || "bg-slate-50 text-slate-700 border-slate-200";
};

const getStatusIcon = (status) => {
  if (status === "Peminjaman Selesai") return <CheckCircle2 className="h-3.5 w-3.5" />;
  if (status === "Sedang Dipinjam") return <Clock className="h-3.5 w-3.5" />;
  if (status === "Menunggu Verifikasi") return <RotateCcw className="h-3.5 w-3.5" />;
  return <AlertCircle className="h-3.5 w-3.5" />;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default function RiwayatPage() {
  const router = useRouter();
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); } }, [toast]);

  useEffect(() => {
    const ctx = getUserContext();
    if (ctx) setUserRole(ctx.role || "");
  }, []);

  useEffect(() => {
    const fetchRiwayat = async () => {
      try {
        const data = await getMyPeminjamanHistory();
        setRiwayat(data);
      } catch (err) {
        console.error("Error fetch riwayat:", err);
        setToast({ message: "Gagal memuat riwayat peminjaman", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchRiwayat();
  }, []);

  const filtered = riwayat.filter((item) => {
    const matchSearch =
      !search ||
      item.kode_pinjam?.toLowerCase().includes(search.toLowerCase()) ||
      item.daftar_aset?.toLowerCase().includes(search.toLowerCase()) ||
      item.alasan_peminjaman?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Stats
  const totalPinjam = riwayat.length;
  const sedangDipinjam = riwayat.filter((r) => r.status === "Sedang Dipinjam").length;
  const selesai = riwayat.filter((r) => r.status === "Peminjaman Selesai").length;
  const menunggu = riwayat.filter((r) =>
    ["Menunggu Persetujuan", "Menunggu Verifikasi"].includes(r.status)
  ).length;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Toast */}
      {mounted && toast &&
        createPortal(
          <div
            className={`fixed top-20 right-6 z-[9999] flex items-center gap-2 rounded-xl px-5 py-3 shadow-lg text-sm font-medium text-white transition-all ${
              toast.type === "error" ? "bg-rose-500" : "bg-emerald-500"
            }`}
          >
            {toast.message}
          </div>,
          document.body
        )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
          <History className="h-6 w-6 text-primary" />
          Riwayat Peminjaman
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Daftar semua peminjaman yang pernah Anda buat
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total</p>
          <p className="text-2xl font-bold text-slate-800">{totalPinjam}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Dipinjam</p>
          <p className="text-2xl font-bold text-blue-700">{sedangDipinjam}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Menunggu</p>
          <p className="text-2xl font-bold text-amber-700">{menunggu}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Selesai</p>
          <p className="text-2xl font-bold text-emerald-700">{selesai}</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden border-t-4 border-t-primary">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kode, aset, atau keperluan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 py-2 px-3 text-sm text-slate-700 focus:border-primary focus:outline-none bg-white cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
            <option value="Sedang Dipinjam">Sedang Dipinjam</option>
            <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
            <option value="Peminjaman Selesai">Peminjaman Selesai</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">
              {riwayat.length === 0 ? "Belum ada riwayat peminjaman" : "Tidak ada data yang sesuai filter"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200">
                <tr className="bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-12">No</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Kode</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Daftar Aset</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Keperluan</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Tgl Pinjam</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item, idx) => (
                  <tr key={item.id} className={`transition-colors hover:bg-slate-50/50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                    <td className="px-5 py-3 text-slate-400 text-xs">{idx + 1}</td>
                    <td className="px-5 py-3 font-mono font-semibold text-slate-700 text-xs">
                      {item.kode_pinjam}
                    </td>
                    <td className="px-5 py-3 text-slate-600 max-w-[200px]">
                      <span className="block truncate text-xs">{item.daftar_aset || "-"}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{item.total_items || 0} item</span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 max-w-[160px]">
                      <span className="block truncate text-xs">{item.alasan_peminjaman || "-"}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 text-xs whitespace-nowrap">
                      {formatDate(item.tanggal_peminjaman)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${getStatusBadge(item.status)}`}
                      >
                        {getStatusIcon(item.status)}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => router.push(`/aset/peminjaman/edit/${item.id}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-medium cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" /> Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-400">
              Menampilkan <span className="font-semibold text-slate-600">{filtered.length}</span> dari{" "}
              <span className="font-semibold text-slate-600">{riwayat.length}</span> riwayat
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
