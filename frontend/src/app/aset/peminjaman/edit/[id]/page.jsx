"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { getPeminjamanById, updatePeminjaman } from "../../../../lib/peminjamanService";

const formatDateForInput = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const formatDatetimeForMySQL = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 19).replace("T", " ");
};

const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  }).format(new Date(dateString)) + " WIB";
};

const getStatusBadge = (status) => {
  const s = {
    "Pending": "bg-amber-50 text-amber-700 border-amber-200",
    "Dikembalikan": "bg-blue-50 text-blue-700 border-blue-200",
    "Approved": "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return s[status] || "bg-slate-50 text-slate-700 border-slate-200";
};

export default function EditPeminjamanPage() {
  const router = useRouter();
  const params = useParams();
  const peminjamanId = params.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Editable fields only
  const [tanggalPengembalian, setTanggalPengembalian] = useState("");
  const [status, setStatus] = useState("");
  const [penerimaAset, setPenerimaAset] = useState("");

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); } }, [toast]);
  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getPeminjamanById(peminjamanId);
      setData(result);
      setTanggalPengembalian(formatDateForInput(result.tanggalPengembalian));
      setStatus(result.status);
      setPenerimaAset(result.penerimaAset || "");
    } catch (err) {
      console.error("Error fetching peminjaman:", err);
      showToast("Gagal memuat data", "error");
    } finally {
      setLoading(false);
    }
  }, [peminjamanId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await updatePeminjaman(peminjamanId, {
        tanggalPengembalian: tanggalPengembalian ? formatDatetimeForMySQL(tanggalPengembalian) : null,
        status,
        penerimaAset,
      });
      showToast("Data peminjaman berhasil diperbarui!");
      setTimeout(() => router.push("/aset/peminjaman"), 1500);
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal memperbarui data", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">Edit Peminjaman</h1></div>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-8 animate-pulse space-y-3">
          {[1,2,3,4].map(i => (<div key={i} className="flex gap-4"><div className="h-4 w-32 rounded bg-slate-200"/><div className="h-4 flex-1 rounded bg-slate-200"/></div>))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-20 text-slate-500">Data peminjaman tidak ditemukan.</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-[100] flex items-center gap-2 rounded-xl px-5 py-3 shadow-lg text-sm font-medium text-white transition-all animate-[slideIn_0.3s_ease] ${toast.type === "error" ? "bg-rose-500" : "bg-emerald-500"}`}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {toast.type === "error" ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />}
          </svg>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.push("/aset/peminjaman")} className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 transition-colors">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Edit Peminjaman #{data.kodePinjam}</h1>
          <p className="text-sm text-slate-500">Update data pengembalian aset</p>
        </div>
      </div>

      {/* Info Read-Only */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm border-t-4 border-t-slate-400 mb-6">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Informasi Terkunci (Read-Only)
          </h2>
          <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${getStatusBadge(data.status)}`}>{data.status}</span>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">No. Peminjaman</label>
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm font-mono font-bold text-primary">{data.kodePinjam}</div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Nama Peminjam</label>
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-700">{data.namaPeminjam}</div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Tanggal Peminjaman</label>
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-700">{formatDateTime(data.tanggalPeminjaman)}</div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Yang Menyerahkan</label>
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-700">{data.yangMenyerahkan || "-"}</div>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-500">Alasan Peminjaman</label>
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-700 min-h-[60px]">{data.alasanPeminjaman || "-"}</div>
          </div>
        </div>

        {/* Items Read-Only */}
        {data.items && data.items.length > 0 && (
          <div className="px-6 pb-6">
            <label className="mb-2 block text-xs font-medium text-slate-500">Daftar Barang Dipinjam</label>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-2 text-left font-semibold text-slate-600 w-10">No</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-600">Nama Aset</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-600 w-20">Kode</th>
                  <th className="px-4 py-2 text-center font-semibold text-slate-600 w-20">Jumlah</th>
                </tr></thead>
                <tbody>
                  {data.items.map((item, i) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-2 text-slate-500">{i + 1}</td>
                      <td className="px-4 py-2 text-slate-700 font-medium">{item.namaAset}</td>
                      <td className="px-4 py-2 text-xs text-slate-400 font-mono">{item.kodeAset}</td>
                      <td className="px-4 py-2 text-center font-semibold text-slate-700">{item.jumlah}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Editable Section */}
      <form onSubmit={handleSubmit}>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm border-t-4 border-t-amber-500 mb-6">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <svg className="h-4 w-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Data Pengembalian (Dapat Diedit)
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Status <span className="text-rose-500">*</span></label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="Pending">Pending</option>
                <option value="Dikembalikan">Dikembalikan</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Tanggal Pengembalian</label>
              <input type="datetime-local" value={tanggalPengembalian} onChange={(e) => setTanggalPengembalian(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Penerima Aset</label>
              <input type="text" placeholder="Siapa yang menerima barang yang dikembalikan" value={penerimaAset} onChange={(e) => setPenerimaAset(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mb-10">
          <button type="button" onClick={() => router.push("/aset/peminjaman")}
            className="cursor-pointer rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
            Batal
          </button>
          <button type="submit" disabled={submitting}
            className="cursor-pointer rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600 disabled:opacity-60">
            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
