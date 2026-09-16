"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPeminjamanByNamaPeminjam, downloadPeminjamanPDF } from "../../lib/peminjamanService";
import { getUserContext } from "../../lib/authService";
import {
  ChevronLeft,
  Calendar,
  Package,
  Eye,
  Download,
  Filter,
  ChevronRight,
} from "lucide-react";

const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
};

const getStatusBadge = (status) => {
  const s = {
    "Menunggu Persetujuan": "bg-amber-100 text-amber-800 border border-amber-300",
    "Sedang Dipinjam": "bg-blue-100 text-blue-800 border border-blue-300",
    "Menunggu Verifikasi": "bg-violet-100 text-violet-800 border border-violet-300",
    "Peminjaman Selesai": "bg-emerald-100 text-emerald-800 border border-emerald-300",
  };
  return s[status] || "bg-slate-100 text-slate-800";
};

const statusOptions = [
  "Semua Status",
  "Menunggu Persetujuan",
  "Sedang Dipinjam",
  "Menunggu Verifikasi",
  "Peminjaman Selesai",
];

export default function RiwayatPeminjamanPage() {
  const router = useRouter();

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [currentUser, setCurrentUser] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const ctx = getUserContext();
    setCurrentUser(ctx);

    if (!ctx || !ctx.nama) {
      router.push("/login");
      return;
    }

    fetchData(ctx.nama);
  }, [router]);

  const fetchData = async (namaPeminjam) => {
    try {
      setLoading(true);
      const result = await getPeminjamanByNamaPeminjam(namaPeminjam);
      setData(result || []);
      setFilteredData(result || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setToast({ message: "Gagal memuat riwayat peminjaman", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    if (status === "Semua Status") {
      setFilteredData(data);
    } else {
      setFilteredData(data.filter((item) => item.status === status));
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      await downloadPeminjamanPDF(id);
      setToast({ message: "PDF berhasil didownload", type: "success" });
    } catch (err) {
      setToast({
        message: "Gagal mendownload PDF",
        type: "error",
      });
    }
  };

  const calculateTotalValue = (items) => {
    return (items || []).reduce(
      (sum, item) => sum + (item.hargaUnit || 0) * item.jumlah,
      0
    );
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Riwayat Peminjaman Saya
            </h1>
            <p className="text-sm text-slate-500">
              {currentUser.nama} • {filteredData.length} peminjaman
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">
              Filter Status:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  statusFilter === status
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600">Memuat riwayat peminjaman...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Tidak ada riwayat peminjaman</p>
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredData.map((item) => {
              const totalValue = calculateTotalValue(item.items || []);
              const totalItems = (item.totalItems || item.items?.length) || 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">
                            {item.kodePinjam}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(item.tanggalPeminjaman).toLocaleDateString(
                              "id-ID"
                            )}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    {/* Info Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 mb-1">Tanggal Peminjaman</p>
                        <p className="font-medium text-slate-900">
                          {formatDateTime(item.tanggalPeminjaman)}
                        </p>
                      </div>

                      {item.tanggalPengembalian && (
                        <div>
                          <p className="text-slate-500 mb-1">
                            Tanggal Pengembalian
                          </p>
                          <p className="font-medium text-slate-900">
                            {formatDateTime(item.tanggalPengembalian)}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-slate-500 mb-1">Jumlah Item</p>
                        <p className="font-medium text-slate-900">
                          {totalItems} item
                        </p>
                      </div>
                    </div>

                    {/* Items Summary */}
                    {item.daftarAset && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-slate-600 mb-2">
                          Item:
                        </p>
                        <p className="text-sm text-slate-900 line-clamp-2">
                          {item.daftarAset}
                        </p>
                      </div>
                    )}

                    {/* Total Value */}
                    {totalValue > 0 && (
                      <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                        <p className="text-xs font-medium text-emerald-600 mb-1">
                          Total Nilai Aset
                        </p>
                        <p className="text-lg font-bold text-emerald-700">
                          Rp {totalValue.toLocaleString()}
                        </p>
                      </div>
                    )}

                    {/* Alasan/Keperluan */}
                    {item.alasanPeminjaman && (
                      <div>
                        <p className="text-xs font-medium text-slate-600 mb-1">
                          Keperluan
                        </p>
                        <p className="text-sm text-slate-900">
                          {item.alasanPeminjaman}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Footer - Actions */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end">
                    <button
                      onClick={() =>
                        router.push(`/aset/peminjaman/edit/${item.id}`)
                      }
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                    >
                      <Eye className="w-4 h-4" />
                      Lihat Detail
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(item.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-700 transition"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Statistics */}
        {data.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 text-center">
              <p className="text-slate-600 text-sm mb-1">Total Peminjaman</p>
              <p className="text-2xl font-bold text-slate-900">{data.length}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 text-center">
              <p className="text-slate-600 text-sm mb-1">Sedang Dipinjam</p>
              <p className="text-2xl font-bold text-blue-600">
                {data.filter((d) => d.status === "Sedang Dipinjam").length}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 text-center">
              <p className="text-slate-600 text-sm mb-1">Menunggu Verifikasi</p>
              <p className="text-2xl font-bold text-violet-600">
                {data.filter((d) => d.status === "Menunggu Verifikasi").length}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 text-center">
              <p className="text-slate-600 text-sm mb-1">Selesai</p>
              <p className="text-2xl font-bold text-emerald-600">
                {data.filter((d) => d.status === "Peminjaman Selesai").length}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white font-medium shadow-lg ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
