"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createPeminjaman, getNextKodePinjam } from "../../../lib/peminjamanService";
import { getAllAssets } from "../../../lib/assetService";
import { getAllAksesoris } from "../../../lib/aksesorisService";
import { getActivePegawai, getApprovers } from "../../../lib/pegawaiService";
import api from "../../../lib/api";
import { getUserContext } from "../../../lib/authService";
import { toCapitalEachWord, toSentenceCase } from "../../../lib/stringUtils";
import { ChevronLeft, FileText, Package, Plus, X, Check, AlertTriangle, Camera, Trash2, Grid, Image as ImageIcon, Search } from "lucide-react";

export default function TambahPeminjamanPage() {
  const router = useRouter();

  // User & Auth State
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");

  // Form Data State
  const [kodePinjam, setKodePinjam] = useState("");
  const [namaPeminjam, setNamaPeminjam] = useState("");
  const [yangMenyerahkan, setYangMenyerahkan] = useState("");
  const [tanggalPeminjaman, setTanggalPeminjaman] = useState("");
  const [keperluanList, setKeperluanList] = useState([{ keperluan: "" }]);
  const [items, setItems] = useState([]);
  const [buktiFiles, setBuktiFiles] = useState([]);
  const [buktiPreviews, setBuktiPreviews] = useState([]);

  // Dropdown Data State
  const [pegawaiList, setPegawaiList] = useState([]);
  const [approversList, setApproversList] = useState([]);
  const [allItems, setAllItems] = useState([]);

  // UI State
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" atau "grid"
  const [itemSearch, setItemSearch] = useState("");
  const [itemFilter, setItemFilter] = useState("semua"); // "semua" | "asset" | "aksesoris"
  const [brandFilter, setBrandFilter] = useState("semua"); // "semua" | "Galeria Studio" | "Galeria Production"
  const [cabinetModalItem, setCabinetModalItem] = useState(null);
  const [selectedCabinetIds, setSelectedCabinetIds] = useState([]);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Initialize user context
  useEffect(() => {
    const ctx = getUserContext();
    if (ctx) {
      setUserRole(ctx.role || "");
      setUserId(ctx.id);
      setUserName(ctx.namaLengkap || "");
      
      // Untuk non-super admin, autofill nama peminjam
      if (ctx.role !== "super admin") {
        setNamaPeminjam(ctx.namaLengkap || "");
      }
    }
  }, []);

  // Toast management
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = "success") => setToast({ message, type });

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    try {
      const [kode, assets, aksesoris, pegawai, approvers] = await Promise.all([
        getNextKodePinjam(),
        getAllAssets(),
        getAllAksesoris(),
        getActivePegawai(),
        getApprovers(),
      ]);

      setKodePinjam(kode);
      setPegawaiList(pegawai);
      setApproversList(approvers);

      // Combine assets dan aksesoris
      const combined = [
        ...assets
          .filter((a) => a.kondisi !== "Dijual")
          .map((a) => {
            const tipeHarga = a.tipeHarga || "Per Unit";
            const jumlahTotal = Number(a.jumlahTotal || a.jumlah || 1);
            const hargaUnit = tipeHarga === "Per Paket" && jumlahTotal > 0
              ? Math.round((Number(a.hargaAset) || 0) / jumlahTotal)
              : (Number(a.hargaAset) || 0);

            return {
              id: a.id,
              nama: a.namaAset,
              kode: a.kodeAset,
              kategori: a.kategori,
              merek: a.merek,
              harga: hargaUnit,
              hargaAsetOriginal: a.hargaAset || 0,
              tipeHarga,
              jumlahTotal,
              stok: a.jumlah,
              kondisi: a.kondisi,
              gambar: a.gambar,
              jenisAset: a.jenisAset,
              tipe: "asset",
              units: a.units || [],
            };
          }),
        ...aksesoris
          .filter((ak) => ak.kondisi !== "Dijual")
          .map((ak) => {
            const tipeHarga = ak.tipeHarga || "Per Unit";
            const jumlahTotal = Number(ak.jumlahTotal || ak.jumlahUnit || 1);
            const hargaUnit = tipeHarga === "Per Paket" && jumlahTotal > 0
              ? Math.round((Number(ak.hargaAset) || 0) / jumlahTotal)
              : (Number(ak.hargaAset) || 0);

            return {
              id: ak.id,
              nama: ak.namaAksesoris,
              kode: ak.kodeAksesoris,
              kategori: ak.kategori,
              merek: ak.merek,
              harga: hargaUnit,
              hargaAsetOriginal: ak.hargaAset || 0,
              tipeHarga,
              jumlahTotal,
              stok: ak.jumlahUnit,
              kondisi: ak.kondisi,
              gambar: ak.gambar,
              jenisAset: ak.jenisAset,
              tipe: "aksesoris",
              units: [],
            };
          }),
      ];
      setAllItems(combined);
    } catch (err) {
      console.error("Error fetching data:", err);
      showToast("Gagal memuat data awal", "error");
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Load temp data
  useEffect(() => {
    if (!isLoaded) {
      const saved = localStorage.getItem("tempPeminjaman");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Hanya restore namaPeminjam untuk super admin (non-super admin sudah autofill)
          if (parsed.namaPeminjam && userRole === "super admin") setNamaPeminjam(parsed.namaPeminjam);
          if (parsed.yangMenyerahkan && userRole === "super admin") setYangMenyerahkan(parsed.yangMenyerahkan);
          if (parsed.tanggalPeminjaman) setTanggalPeminjaman(parsed.tanggalPeminjaman);
          if (parsed.keperluanList) setKeperluanList(parsed.keperluanList);
          if (parsed.items) setItems(parsed.items);
        } catch (e) {}
      }
      setIsLoaded(true);
    }
  }, [isLoaded, userRole]);

  // Save temp data
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        "tempPeminjaman",
        JSON.stringify({
          namaPeminjam,
          yangMenyerahkan,
          tanggalPeminjaman,
          keperluanList,
          items,
        })
      );
    }
  }, [namaPeminjam, yangMenyerahkan, tanggalPeminjaman, keperluanList, items, isLoaded]);

  // File handling
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/heic", "image/heif", "image/webp"];
    const validExts = [".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp"];
    let filesToAdd = [];

    for (let file of files) {
      const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
      if (!validTypes.includes(file.type) && !validExts.includes(ext)) {
        showToast("Format file harus JPG, JPEG, PNG, HEIC, atau WebP", "error");
        e.target.value = "";
        return;
      }
      filesToAdd.push(file);
    }

    if (buktiFiles.length + filesToAdd.length > 5) {
      showToast("Maksimal 5 gambar", "error");
      e.target.value = "";
      return;
    }

    const updated = [...buktiFiles, ...filesToAdd];
    setBuktiFiles(updated);

    const previews = updated.map((f) => URL.createObjectURL(f));
    setBuktiPreviews(previews);
    e.target.value = "";
  };

  const removeFile = (index) => {
    const updated = buktiFiles.filter((_, i) => i !== index);
    setBuktiFiles(updated);
    setBuktiPreviews(updated.map((f) => URL.createObjectURL(f)));
  };

  // Keperluan management
  const addKeperluan = () => {
    setKeperluanList([...keperluanList, { keperluan: "" }]);
  };

  const removeKeperluan = (index) => {
    if (keperluanList.length > 1) {
      setKeperluanList(keperluanList.filter((_, i) => i !== index));
    }
  };

  const updateKeperluan = (index, field, value) => {
    const updated = [...keperluanList];
    updated[index][field] = field === "keperluan" ? toSentenceCase(value) : value;
    setKeperluanList(updated);
  };

  // Cabinet modal management
  const openCabinetModal = (item) => {
    const existing = items.find((it) => it.id === item.id && it.tipe === item.tipe);
    setCabinetModalItem(item);
    if (existing && existing.unitIds) {
      setSelectedCabinetIds([...existing.unitIds]);
    } else {
      const availableIds = (item.units || [])
        .filter((u) => u.status_pinjam === "Tersedia" && u.kondisi !== "Rusak" && u.kondisi !== "Rusak Berat")
        .map((u) => u.id);
      setSelectedCabinetIds(availableIds);
    }
  };

  const toggleCabinet = (unitId, isDisabled) => {
    if (isDisabled) return;
    if (selectedCabinetIds.includes(unitId)) {
      setSelectedCabinetIds(selectedCabinetIds.filter((id) => id !== unitId));
    } else {
      setSelectedCabinetIds([...selectedCabinetIds, unitId]);
    }
  };

  const handleSaveCabinetSelection = () => {
    if (!cabinetModalItem) return;
    if (selectedCabinetIds.length === 0) {
      showToast("Pilih minimal 1 kabinet", "error");
      return;
    }

    const selectedUnits = (cabinetModalItem.units || []).filter((u) => selectedCabinetIds.includes(u.id));
    const unitNames = selectedUnits.map((u) => u.nama_unit || u.kode_unit).join(", ");

    const existingIndex = items.findIndex((it) => it.id === cabinetModalItem.id && it.tipe === cabinetModalItem.tipe);
    const newItem = {
      id: cabinetModalItem.id,
      nama: cabinetModalItem.nama,
      kode: cabinetModalItem.kode,
      tipe: cabinetModalItem.tipe,
      harga: cabinetModalItem.harga,
      tipeHarga: cabinetModalItem.tipeHarga,
      hargaAsetOriginal: cabinetModalItem.hargaAsetOriginal,
      jumlahTotal: cabinetModalItem.jumlahTotal,
      stok: cabinetModalItem.stok,
      jumlah: selectedCabinetIds.length,
      kategori: cabinetModalItem.kategori,
      merek: cabinetModalItem.merek,
      jenisAset: cabinetModalItem.jenisAset,
      hasUnits: true,
      units: cabinetModalItem.units,
      unitIds: selectedCabinetIds,
      unitNames: unitNames,
    };

    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex] = newItem;
      setItems(updated);
      showToast(`Pilihan kabinet ${cabinetModalItem.nama} diperbarui (${selectedCabinetIds.length} kabinet)`, "success");
    } else {
      setItems([...items, newItem]);
      showToast(`${cabinetModalItem.nama} ditambahkan (${selectedCabinetIds.length} kabinet)`, "success");
    }

    setCabinetModalItem(null);
    setSelectedCabinetIds([]);
  };

  // Item management
  const addItemToList = (item) => {
    if (item.units && item.units.length > 0) {
      openCabinetModal(item);
      return;
    }

    const alreadySelected = items.some(
      (it) => it.id === item.id && it.tipe === item.tipe
    );
    if (alreadySelected) {
      showToast("Item sudah dipilih", "error");
      return;
    }

    if (item.kondisi !== "Siap Digunakan") {
      showToast(`"${item.nama}" tidak dalam kondisi Siap Digunakan`, "error");
      return;
    }

    if (item.stok <= 0) {
      showToast(`"${item.nama}" stok kosong`, "error");
      return;
    }

    setItems([
      ...items,
      {
        id: item.id,
        nama: item.nama,
        kode: item.kode,
        tipe: item.tipe,
        harga: item.harga,
        tipeHarga: item.tipeHarga,
        hargaAsetOriginal: item.hargaAsetOriginal,
        jumlahTotal: item.jumlahTotal,
        stok: item.stok,
        jumlah: 1,
        kategori: item.kategori,
        merek: item.merek,
        jenisAset: item.jenisAset,
      },
    ]);
  };

  const removeItemFromList = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItemJumlah = (index, jumlah) => {
    const updated = [...items];
    updated[index].jumlah = Math.max(1, Math.min(jumlah, updated[index].stok));
    setItems(updated);
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!namaPeminjam || !tanggalPeminjaman) {
      showToast("Nama peminjam dan tanggal harus diisi", "error");
      return;
    }

    if (userRole === "super admin" && !yangMenyerahkan) {
      showToast("Yang menyerahkan harus diisi", "error");
      return;
    }

    if (!keperluanList[0]?.keperluan?.trim()) {
      showToast("Keperluan peminjaman harus diisi", "error");
      return;
    }

    if (items.length === 0) {
      showToast("Pilih minimal 1 item", "error");
      return;
    }

    if (buktiFiles.length === 0) {
      showToast("Upload bukti peminjaman minimal 1 gambar", "error");
      return;
    }

    // Validate stock
    for (const item of items) {
      if (item.jumlah > item.stok) {
        showToast(`Stok "${item.nama}" tidak cukup`, "error");
        return;
      }
    }

    try {
      setSubmitting(true);

      // Otomatis capture current time saat simpan
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const dateTimeStr = `${tanggalPeminjaman} ${hours}:${minutes}:${seconds}`;

      const formattedKeperluanList = keperluanList
        .filter((k) => k.keperluan?.trim())
        .map((k) => ({ ...k, keperluan: toSentenceCase(k.keperluan.trim()) }));

      await createPeminjaman(
        {
          namaPeminjam: toCapitalEachWord(namaPeminjam.trim()),
          yangMenyerahkan: yangMenyerahkan?.trim() ? toCapitalEachWord(yangMenyerahkan.trim()) : null,
          tanggalPeminjaman: dateTimeStr,
          alasanPeminjaman: formattedKeperluanList[0]?.keperluan || "",
          keperluanList: formattedKeperluanList,
          items: items.map((item) => ({
            [item.tipe === "asset" ? "assetId" : "aksesorisId"]: item.id,
            jumlah: parseInt(item.jumlah) || 0,
            unitIds: item.unitIds || undefined,
          })),
        },
        buktiFiles
      );

      showToast("Peminjaman berhasil dibuat!", "success");
      localStorage.removeItem("tempPeminjaman");

      setTimeout(() => {
        router.push("/aset/peminjaman");
      }, 1500);
    } catch (err) {
      showToast(err.message || "Gagal membuat peminjaman", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper functions
  const getKondisiBadge = (kondisi, isList = false) => {
    const borderClass = isList ? " border " : "";
    const badges = {
      "Siap Digunakan": `bg-green-100 text-green-800${isList ? " border-green-200" : ""}`,
      Rusak: `bg-red-100 text-red-800${isList ? " border-red-200" : ""}`,
      "Rusak Berat": `bg-red-900 text-white${isList ? " border-red-800" : ""}`,
      Maintenance: `bg-yellow-100 text-yellow-800${isList ? " border-yellow-200" : ""}`,
    };
    return (badges[kondisi] || `bg-gray-100 text-gray-800${isList ? " border-gray-200" : ""}`) + borderClass;
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.harga * item.jumlah, 0);
  };

  const renderBrandBadge = (jenisAset, isList = false) => {
    const borderClass = isList ? " border " : "";
    const baseClass = `${isList ? "w-[84px]" : "w-auto"} text-center inline-block text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 rounded-full font-semibold shrink-0`;
    if (jenisAset === "Galeria Studio") {
      return <span className={`${baseClass} bg-amber-100 text-amber-700${borderClass}${isList ? "border-amber-200" : ""}`}>Studio</span>;
    }
    if (jenisAset === "Galeria Production") {
      return <span className={`${baseClass} bg-teal-100 text-teal-700${borderClass}${isList ? "border-teal-200" : ""}`}>Production</span>;
    }
    return null;
  };

  // Filtered items for search & filter
  const filteredItems = allItems.filter((item) => {
    const matchSearch = itemSearch === "" ||
      item.nama.toLowerCase().includes(itemSearch.toLowerCase()) ||
      item.kode.toLowerCase().includes(itemSearch.toLowerCase()) ||
      (item.kategori && item.kategori.toLowerCase().includes(itemSearch.toLowerCase())) ||
      (item.merek && item.merek.toLowerCase().includes(itemSearch.toLowerCase()));
    const matchTipe = itemFilter === "semua" || item.tipe === itemFilter;
    const matchBrand = brandFilter === "semua" || item.jenisAset === brandFilter;
    return matchSearch && matchTipe && matchBrand;
  });

  if (itemFilter === "semua" && brandFilter === "semua") {
    filteredItems.sort((a, b) => a.nama.localeCompare(b.nama));
  }

  // Render
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="cursor-pointer p-2 bg-primary rounded-lg transition hover:bg-primary-hover"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Tambah Peminjaman Alat</h1>
              <p className="text-sm text-slate-500">Kode: {kodePinjam}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Data Peminjam & Keperluan (Merged) */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-primary p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informasi Peminjaman
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Nama Peminjam - Manual Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nama Peminjam *
                </label>
                <p className="mb-2 -mt-1 text-xs text-slate-400 italic">↳ Nama orang yang meminjam alat</p>
                <input
                  type="text"
                  placeholder="Masukkan nama peminjam"
                  value={namaPeminjam}
                  onChange={(e) => setNamaPeminjam(toCapitalEachWord(e.target.value))}
                  readOnly={userRole !== "super admin"}
                  className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none ${userRole !== "super admin" ? "bg-slate-50 cursor-not-allowed text-slate-500" : ""}`}
                  required
                />
              </div>

              {/* Tanggal Peminjaman */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tanggal Peminjaman *
                </label>
                <p className="mb-2 -mt-1 text-xs text-slate-400 italic">↳ Tanggal alat mulai dipinjam</p>
                <input
                  type="date"
                  value={tanggalPeminjaman}
                  onChange={(e) => setTanggalPeminjaman(e.target.value)}
                  min={userRole !== "super admin" ? new Date().toISOString().split("T")[0] : undefined}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              {/* Yang Menyerahkan - Hanya visible untuk super admin */}
              {userRole === "super admin" && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Yang Menyerahkan *
                  </label>
                  <p className="mb-2 -mt-1 text-xs text-slate-400 italic">↳ Penanggung jawab yang menyerahkan alat</p>
                  <input
                    type="text"
                    placeholder="Masukkan nama yang menyerahkan"
                    value={yangMenyerahkan}
                    onChange={(e) => setYangMenyerahkan(toCapitalEachWord(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>
              )}
            </div>

            {/* Divider */}
            <hr className="my-6 border-slate-200" />

            {/* Keperluan Peminjaman (merged into this card) */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Keperluan Peminjaman
              </h3>
              <button
                type="button"
                onClick={addKeperluan}
                className="cursor-pointer flex items-center gap-2 px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary-hover transition"
              >
                <Plus className="w-4 h-4" /> Tambah Keperluan
              </button>
            </div>

            <div className="space-y-3">
              {keperluanList.map((k, idx) => (
                <div key={idx} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Keperluan peminjaman (misal: Acara, Dokumentasi, dsb)"
                    value={k.keperluan}
                    onChange={(e) => updateKeperluan(idx, "keperluan", e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                    required={idx === 0}
                  />
                  <button
                    type="button"
                    onClick={() => removeKeperluan(idx)}
                    className="cursor-pointer p-2 text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
                    disabled={keperluanList.length === 1}
                    style={{ opacity: keperluanList.length === 1 ? 0.5 : 1 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Item Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-primary p-6">
            {/* Header Row: Title + Search + Filter + View Toggle */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 shrink-0">
                <Package className="w-5 h-5" />
                Pilih Item ({items.length} terpilih)
              </h2>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 lg:justify-end">
                {/* Search */}
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama, kode, kategori..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                {/* Filter Dropdowns */}
                <div className="flex gap-2 items-center">
                  <select
                    value={itemFilter}
                    onChange={(e) => setItemFilter(e.target.value)}
                    className="cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none bg-white"
                  >
                    <option value="semua">Semua Tipe</option>
                    <option value="asset">Aset</option>
                    <option value="aksesoris">Aksesoris</option>
                  </select>
                  <select
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className="cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none bg-white"
                  >
                    <option value="semua">Semua Brand</option>
                    <option value="Galeria Studio">Galeria Studio</option>
                    <option value="Galeria Production">Galeria Production</option>
                  </select>
                </div>
                {/* View Mode Toggle */}
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`cursor-pointer px-3 py-2 text-sm rounded-lg transition ${
                      viewMode === "list"
                        ? "bg-primary text-white hover:bg-primary-hover"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    List
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`cursor-pointer px-3 py-2 text-sm rounded-lg transition ${
                      viewMode === "grid"
                        ? "bg-primary text-white hover:bg-primary-hover"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Grid className="w-4 h-4 inline mr-1" /> Grid
                  </button>
                </div>
              </div>
            </div>

            {/* Item Selection - Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 max-h-96 overflow-y-auto">
                {filteredItems.map((item) => (
                  <div
                    key={`${item.tipe}-${item.id}`}
                    onClick={() => addItemToList(item)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      items.some((it) => it.id === item.id && it.tipe === item.tipe)
                        ? "border-primary bg-blue-50"
                        : "border-slate-200 hover:border-primary hover:bg-slate-50"
                    } ${item.kondisi !== "Siap Digunakan" || item.stok <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {/* Gambar */}
                    <div className="mb-3 h-40 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                      {item.gambar ? (
                        <Image
                          src={item.gambar}
                          alt={item.nama}
                          width={150}
                          height={150}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-slate-400" />
                      )}
                    </div>

                    {/* Info */}
                    <p className="font-semibold text-slate-900 text-sm truncate">{item.nama}</p>
                    <p className="text-xs text-slate-500">{item.kode}</p>

                    {/* Badge */}
                    <div className="flex gap-1 mt-2 flex-nowrap items-center">
                      {renderBrandBadge(item.jenisAset, false)}
                      <span className={`shrink-0 text-center inline-block text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 rounded-full font-semibold ${
                        item.tipe === "asset"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}>
                        {item.tipe === "asset" ? "Aset" : "Aksesoris"}
                      </span>
                      <span className={`shrink-0 text-center inline-block text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 rounded-full font-semibold ${getKondisiBadge(item.kondisi, false)}`}>
                        {item.kondisi}
                      </span>
                    </div>

                    {/* Stok & Harga */}
                    <div className="mt-2 pt-2 border-t border-slate-200 text-xs">
                      <p className="text-slate-600">Stok: <span className="font-semibold">{item.stok}</span></p>
                      {item.harga > 0 && (
                        <div>
                          <p className="text-slate-600">Harga: <span className="font-semibold text-emerald-600">Rp {(item.harga || 0).toLocaleString('id-ID')}/unit</span></p>
                          {item.tipeHarga === "Per Paket" && (
                            <p className="text-[10px] text-purple-600 font-medium">(Paket: Rp {Number(item.hargaAsetOriginal).toLocaleString('id-ID')})</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Preview Kabinet Videotron/Unit */}
                    {item.units && item.units.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span className="font-medium">Kabinet:</span>
                          <span className="text-[10px] font-semibold text-primary">
                            {item.units.filter(u => u.status_pinjam === 'Tersedia').length}/{item.units.length} Siap
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.units.map((u) => {
                            const isDipinjam = u.status_pinjam === "Dipinjam";
                            const isRusak = u.kondisi === "Rusak" || u.kondisi === "Rusak Berat";
                            const isUnavailable = isDipinjam || isRusak;
                            const isSel = items.find(it => it.id === item.id && it.tipe === item.tipe)?.unitIds?.includes(u.id);
                            return (
                              <span
                                key={u.id}
                                className={`text-[10px] px-1 py-0.5 rounded font-bold ${
                                  isSel
                                    ? "bg-blue-600 text-white"
                                    : isUnavailable
                                    ? "bg-slate-200 text-slate-400 line-through"
                                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                }`}
                                title={`${u.nama_unit} (${isDipinjam ? "Dipinjam" : isRusak ? "Rusak" : "Tersedia"})`}
                              >
                                {u.nama_unit}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {items.some((it) => it.id === item.id && it.tipe === item.tipe) && (
                      <div className="mt-2 flex items-center justify-center text-primary text-xs font-semibold">
                        <Check className="w-4 h-4 mr-1" />
                        {items.find(it => it.id === item.id && it.tipe === item.tipe)?.unitIds?.length
                          ? `${items.find(it => it.id === item.id && it.tipe === item.tipe).unitIds.length} Kabinet Terpilih`
                          : "Terpilih"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Item Selection - List View */}
            {viewMode === "list" && (
              <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                {filteredItems.map((item) => (
                  <div
                    key={`${item.tipe}-${item.id}`}
                    onClick={() => addItemToList(item)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-2 ${
                      items.some((it) => it.id === item.id && it.tipe === item.tipe)
                        ? "border-primary bg-blue-50"
                        : "border-slate-200 hover:border-primary"
                    } ${item.kondisi !== "Siap Digunakan" || item.stok <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 w-full">
                      <div className="flex items-center gap-2 shrink-0">
                        {renderBrandBadge(item.jenisAset, true)}
                        <span className={`w-[84px] text-center inline-block text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 rounded-full font-semibold border shrink-0 ${
                          item.tipe === "asset"
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : "bg-purple-100 text-purple-700 border-purple-200"
                        }`}>
                          {item.tipe === "asset" ? "Aset" : "Aksesoris"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 mt-1 sm:mt-0">
                        <p className="font-semibold text-slate-900 truncate">{item.nama}</p>
                        <p className="text-xs text-slate-500 truncate">{item.kode} • {item.kategori} • {item.merek}</p>
                        {item.units && item.units.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            <span className="text-[10px] text-slate-400 font-medium">Kabinet:</span>
                            {item.units.map((u) => {
                              const isDipinjam = u.status_pinjam === "Dipinjam";
                              const isRusak = u.kondisi === "Rusak" || u.kondisi === "Rusak Berat";
                              const isUnavailable = isDipinjam || isRusak;
                              const isSel = items.find(it => it.id === item.id && it.tipe === item.tipe)?.unitIds?.includes(u.id);
                              return (
                                <span
                                  key={u.id}
                                  className={`text-[10px] px-1 py-0.5 rounded font-bold ${
                                    isSel
                                      ? "bg-blue-600 text-white"
                                      : isUnavailable
                                      ? "bg-slate-200 text-slate-400 line-through"
                                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  }`}
                                  title={`${u.nama_unit} (${isDipinjam ? "Dipinjam" : isRusak ? "Rusak" : "Tersedia"})`}
                                >
                                  {u.nama_unit}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-2 shrink-0 border-t sm:border-0 border-slate-100 pt-2 sm:pt-0 w-full sm:w-auto">
                      <div className="flex items-center gap-3 sm:gap-2">
                        <span className="text-xs font-semibold text-slate-600">Stok: {item.stok}</span>
                        {item.harga > 0 && (
                          <div className="flex flex-col text-right">
                            <span className="text-xs font-semibold text-emerald-600">Rp {(item.harga || 0).toLocaleString('id-ID')}</span>
                            {item.tipeHarga === "Per Paket" && (
                              <span className="text-[10px] text-purple-600 font-medium">Paket</span>
                            )}
                          </div>
                        )}
                      </div>
                      <span className={`text-center inline-block text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-semibold border ${getKondisiBadge(item.kondisi, true)}`}>
                        {item.kondisi}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {filteredItems.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Tidak ada item yang cocok dengan pencarian</p>
              </div>
            )}
          </div>

          {/* Section 3: Selected Items */}
          {items.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-primary p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Item Terpilih</h3>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg border-2 border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Item Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 w-full">
                      <div className="flex items-center gap-2 shrink-0">
                        {renderBrandBadge(item.jenisAset, true)}
                        <span className={`w-[84px] text-center inline-block text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 rounded-full font-semibold border shrink-0 ${
                          item.tipe === "asset"
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : "bg-purple-100 text-purple-700 border-purple-200"
                        }`}>
                          {item.tipe === "asset" ? "Aset" : "Aksesoris"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 mt-1 sm:mt-0">
                        <p className="font-semibold text-slate-900 truncate">{item.nama}</p>
                        <p className="text-xs text-slate-500 truncate">{item.kode} • Stok: {item.stok}</p>
                        {item.hasUnits && (
                          <div className="flex flex-wrap items-center gap-1 mt-1.5">
                            <span className="text-[11px] text-slate-500 font-semibold">Kabinet:</span>
                            {(item.units || [])
                              .filter((u) => item.unitIds?.includes(u.id))
                              .map((u) => (
                                <span key={u.id} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded border border-blue-200">
                                  {u.nama_unit || u.kode_unit}
                                </span>
                              ))}
                            <button
                              type="button"
                              onClick={() => {
                                const orig = allItems.find((it) => it.id === item.id && it.tipe === item.tipe) || item;
                                openCabinetModal(orig);
                              }}
                              className="cursor-pointer text-xs text-primary hover:underline font-semibold ml-2"
                            >
                              Ubah Kabinet
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      {item.harga > 0 && (
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-semibold text-emerald-600">
                            Rp {(item.harga * item.jumlah).toLocaleString('id-ID')}
                          </p>
                        </div>
                      )}
                      
                      {item.hasUnits ? (
                        <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                          <span className="text-xs font-bold text-blue-800">{item.jumlah} Kabinet</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                          <label className="text-xs text-slate-600 font-medium ml-1">Jml:</label>
                          <input
                            type="number"
                            min="1"
                            max={item.stok}
                            value={item.jumlah}
                            onChange={(e) => updateItemJumlah(idx, parseInt(e.target.value))}
                            className="w-14 rounded bg-white border border-slate-300 px-2 py-1 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                          />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => removeItemFromList(idx)}
                        className="cursor-pointer p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition"
                        title="Hapus Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Value */}
              {items.some((it) => it.harga > 0) && (
                <div className="mt-4 pt-4 border-t border-slate-200 text-right">
                  <p className="text-sm text-slate-600">Total Nilai Aset:</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    Rp {calculateTotal().toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Anda bertanggung jawab atas aset di atas
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Section 4: Bukti Peminjaman */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-primary p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Bukti Peminjaman ({buktiFiles.length}/5)
            </h2>

            <div className="space-y-4">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-primary/50 transition">
                <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">Upload Bukti Peminjaman</p>
                <p className="text-xs text-slate-400 mb-4">PNG, JPG, HEIC, WebP (maks. 5 gambar)</p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  {/* Opsi Kamera */}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 shadow-sm rounded-xl hover:border-primary hover:text-primary transition-colors text-sm font-semibold text-slate-700"
                  >
                    <Camera className="h-4 w-4 text-primary" />
                    Buka Kamera
                  </button>

                  {/* Opsi Galeri */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/heic,image/heif,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 shadow-sm rounded-xl hover:border-primary hover:text-primary transition-colors text-sm font-semibold text-slate-700"
                  >
                    <ImageIcon className="h-4 w-4 text-primary" />
                    Pilih Galeri
                  </button>
                </div>
              </div>

              {/* Preview */}
              {buktiPreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {buktiPreviews.map((preview, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="cursor-pointer absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="cursor-pointer px-6 py-2.5 rounded-lg border-2 border-slate-400 text-slate-700 font-semibold hover:bg-slate-200 hover:border-slate-500 hover:text-slate-900 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {submitting ? "Menyimpan..." : "Simpan Peminjaman"}
            </button>
          </div>
        </form>

      {/* Modal Pemilihan Kabinet / Unit */}
      {cabinetModalItem && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-primary">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Pilih Kabinet {cabinetModalItem.nama}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {cabinetModalItem.kode} • Total {cabinetModalItem.units?.length || 0} kabinet terdaftar
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCabinetModalItem(null)}
                className="cursor-pointer p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Quick actions & stats */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <span className="text-xs font-medium text-slate-600">
                  Kabinet Terpilih: <strong className="text-primary font-bold">{selectedCabinetIds.length}</strong> dari {cabinetModalItem.units?.filter(u => u.status_pinjam === 'Tersedia').length || 0} tersedia
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const avail = (cabinetModalItem.units || [])
                        .filter((u) => u.status_pinjam === "Tersedia" && u.kondisi !== "Rusak" && u.kondisi !== "Rusak Berat")
                        .map((u) => u.id);
                      setSelectedCabinetIds(avail);
                    }}
                    className="cursor-pointer text-xs px-2.5 py-1 rounded bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition"
                  >
                    Pilih Semua Tersedia
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCabinetIds([])}
                    className="cursor-pointer text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Cabinet Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(cabinetModalItem.units || []).map((u) => {
                  const isDipinjam = u.status_pinjam === "Dipinjam";
                  const isRusak = u.kondisi === "Rusak" || u.kondisi === "Rusak Berat";
                  const isUnavailable = isDipinjam || isRusak;
                  const isSelected = selectedCabinetIds.includes(u.id);

                  return (
                    <div
                      key={u.id}
                      onClick={() => !isUnavailable && toggleCabinet(u.id, isUnavailable)}
                      className={`relative p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between select-none ${
                        isUnavailable
                          ? "bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed"
                          : isSelected
                          ? "bg-blue-50 border-primary shadow-sm cursor-pointer ring-1 ring-primary"
                          : "bg-white border-slate-200 hover:border-primary/50 hover:bg-slate-50 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-base font-bold ${
                          isSelected ? "text-primary" : isUnavailable ? "text-slate-400" : "text-slate-800"
                        }`}>
                          {u.nama_unit || u.kode_unit}
                        </span>
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-md bg-primary text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className={`w-5 h-5 rounded-md border ${
                            isUnavailable ? "border-slate-300 bg-slate-200" : "border-slate-300 bg-white"
                          }`} />
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                        <span className="text-slate-500 font-mono text-[10px] truncate max-w-[70px]">
                          {u.kode_unit}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          isDipinjam
                            ? "bg-amber-100 text-amber-800"
                            : isRusak
                            ? "bg-red-100 text-red-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {isDipinjam ? "Dipinjam" : isRusak ? "Rusak" : "Tersedia"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Calculation Box */}
              {cabinetModalItem.harga > 0 && (
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block">Estimasi Nilai ({selectedCabinetIds.length} kabinet):</span>
                    <span className="text-[11px] text-slate-400">
                      @ Rp {cabinetModalItem.harga.toLocaleString("id-ID")} / kabinet
                    </span>
                  </div>
                  <span className="text-base font-bold text-emerald-600">
                    Rp {(cabinetModalItem.harga * selectedCabinetIds.length).toLocaleString("id-ID")}
                  </span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCabinetModalItem(null)}
                className="cursor-pointer px-4 py-2 text-sm rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-200 transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={selectedCabinetIds.length === 0}
                onClick={handleSaveCabinetSelection}
                className="cursor-pointer px-5 py-2 text-sm rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Simpan ({selectedCabinetIds.length} Kabinet)
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Toast */}
      {toast && createPortal(
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white font-medium shadow-lg animation-fade-in ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          {toast.message}
        </div>,
        document.body
      )}
    </div>
  );
}
