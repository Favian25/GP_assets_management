"use client";

export default function ReportsLayout({ children }) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Laporan (Reports)</h1>
        <p className="text-sm text-slate-500">Pusat data laporan dan rekam jejak sistem.</p>
      </div>

      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}
