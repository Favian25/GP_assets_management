"use client";

import { useState, useEffect } from "react";
import { getDashboardStats } from "./lib/assetService";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError("Gagal memuat statistik dashboard. Pastikan backend berjalan.");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Aset",
      value: stats?.total ?? 0,
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: "bg-blue-500",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Siap Digunakan",
      value: stats?.tersedia ?? 0,
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-emerald-500",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      title: "Rusak",
      value: stats?.rusak ?? 0,
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-rose-500",
      bgLight: "bg-rose-50",
      textColor: "text-rose-600",
    },
    {
      title: "Maintenance",
      value: stats?.maintenance ?? 0,
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: "bg-amber-500",
      bgLight: "bg-amber-50",
      textColor: "text-amber-600",
    },
  ];

  // Loading skeleton
  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Selamat datang di Sistem Pencatatan Asset Galeria Production
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm animate-pulse">
              <div className="h-12 w-12 rounded-xl bg-slate-200" />
              <div className="space-y-2">
                <div className="h-3 w-20 rounded bg-slate-200" />
                <div className="h-6 w-12 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-xl border border-slate-100 bg-white p-6 shadow-sm animate-pulse">
          <div className="h-5 w-40 rounded bg-slate-200 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="h-2 w-2 rounded-full bg-slate-200" />
                <div className="h-3 flex-1 rounded bg-slate-200" />
                <div className="h-3 w-20 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Selamat datang di Sistem Pencatatan Asset Galeria Production
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-10">
          <svg className="h-12 w-12 text-rose-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.732c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm font-medium text-rose-700 mb-1">Koneksi Gagal</p>
          <p className="text-xs text-rose-500 mb-4 text-center">{error}</p>
          <button
            onClick={fetchStats}
            className="cursor-pointer rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-600"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Tentukan tipe aktivitas berdasarkan kondisi
  const getActivityType = (kondisi) => {
    if (kondisi === "Siap Digunakan") return "add";
    if (kondisi === "Rusak") return "return";
    if (kondisi === "Maintenance") return "maintenance";
    if (kondisi === "Diarsipkan") return "borrow";
    return "add";
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Selamat datang di Sistem Pencatatan Asset Galeria Production
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgLight} ${stat.textColor}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Assets dari API */}
      <div className="mt-8 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Aset Terbaru
        </h2>
        <div className="space-y-3">
          {stats?.recentAssets && stats.recentAssets.length > 0 ? (
            stats.recentAssets.map((asset, index) => (
              <div key={asset.id || index} className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-50 transition-colors">
                <div className={`h-2 w-2 rounded-full ${
                  getActivityType(asset.kondisi) === "add" ? "bg-blue-500" :
                  getActivityType(asset.kondisi) === "borrow" ? "bg-amber-500" :
                  getActivityType(asset.kondisi) === "return" ? "bg-rose-500" :
                  "bg-amber-500"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-600 truncate">
                    <span className="font-medium">{asset.namaAset}</span>
                    <span className="text-slate-400"> — {asset.kodeAset}</span>
                  </p>
                </div>
                <span className={`shrink-0 inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  asset.kondisi === "Siap Digunakan" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  asset.kondisi === "Rusak" ? "bg-red-50 text-red-700 border-red-200" :
                  asset.kondisi === "Maintenance" ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-slate-100 text-slate-600 border-slate-200"
                }`}>
                  {asset.kondisi}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-sm text-slate-400">
              Belum ada data aset.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
