import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";

/**
 * Export data to PDF using jsPDF and jspdf-autotable
 * @param {Array} columns - Array of column objects { header: 'Name', dataKey: 'key' }
 * @param {Array} data - Array of objects matching dataKeys
 * @param {String} filename - Output filename
 * @param {String} title - Title printed on the PDF document
 */
export const exportToPDF = (columns, data, filename = "Report.pdf", title = "Laporan") => {
  const doc = new jsPDF();

  // Add Title
  doc.setFontSize(16);
  doc.text(title, 14, 15);
  doc.setFontSize(10);
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`, 14, 22);

  // Generate Table
  autoTable(doc, {
    startY: 28,
    head: [columns.map(col => col.header)],
    body: data.map(item => columns.map(col => item[col.dataKey] || "-")),
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [51, 65, 85] }, // slate-700
    alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
  });

  doc.save(filename);
};

/**
 * Export data to Excel as an Official Native Excel Table using ExcelJS
 * @param {Array} columns - Array of column objects { header: 'Name', dataKey: 'key' }
 * @param {Array} data - Array of objects matching dataKeys
 * @param {String} filename - Output filename
 * @param {String} sheetName - Worksheet name
 */
export const exportToExcel = async (columns, data, filename = "Report.xlsx", sheetName = "Data") => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Galeria Asset Management";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true }]
  });

  // Table columns definition
  const tableColumns = columns.map(col => ({
    name: col.header,
    filterButton: true,
  }));

  // Row data: 2D array [ [valCol1, valCol2, ...], ... ]
  const rows = data.map(item => {
    return columns.map(col => {
      const val = item[col.dataKey];
      if (val === null || val === undefined) return "-";
      return val;
    });
  });

  // Sanitized unique table name (alphanumeric and underscores only)
  const safeTableName = `Table_${sheetName.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}`;

  // Add native official Excel table
  worksheet.addTable({
    name: safeTableName,
    ref: "A1",
    headerRow: true,
    totalsRow: false,
    style: {
      theme: "TableStyleMedium9", // Modern blue/navy theme with zebra stripes & border
      showRowStripes: true,
    },
    columns: tableColumns,
    rows: rows.length > 0 ? rows : [columns.map(() => "-")],
  });

  // Auto-fit column widths based on maximum content length
  columns.forEach((col, idx) => {
    let maxLen = col.header ? String(col.header).length : 10;
    data.forEach(item => {
      const val = item[col.dataKey];
      if (val !== null && val !== undefined) {
        const str = String(val);
        if (str.length > maxLen) {
          maxLen = str.length;
        }
      }
    });

    const worksheetColumn = worksheet.getColumn(idx + 1);
    worksheetColumn.width = Math.min(Math.max(maxLen + 4, 14), 45);
    worksheetColumn.alignment = { vertical: "middle", horizontal: "left" };
  });

  // Generate binary buffer & trigger download in browser
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

/**
 * Download Template Excel untuk Import Aset
 */
export const downloadAssetTemplate = async () => {
  const columns = [
    { header: "Nama Aset", dataKey: "namaAset" },
    { header: "Jenis Brand", dataKey: "jenisAset" },
    { header: "Kategori", dataKey: "kategori" },
    { header: "Merek", dataKey: "merek" },
    { header: "Model", dataKey: "model" },
    { header: "Jumlah", dataKey: "jumlah" },
    { header: "Harga Aset", dataKey: "hargaAset" },
    { header: "Tanggal Pembelian", dataKey: "tanggalPembelian" },
    { header: "Lokasi Aset", dataKey: "lokasiAset" },
    { header: "Kondisi", dataKey: "kondisi" },
    { header: "Pengelola", dataKey: "pengguna" },
    { header: "Serial Number", dataKey: "noSN" },
    { header: "Spesifikasi", dataKey: "spesifikasi" },
    { header: "Keterangan", dataKey: "keterangan" },
  ];

  const sampleData = [
    {
      namaAset: "Sony Alpha 7 III Body",
      jenisAset: "Galeria Production",
      kategori: "Kamera",
      merek: "Sony",
      model: "ILCE-7M3",
      jumlah: 1,
      hargaAset: 25000000,
      tanggalPembelian: "2024-01-15",
      lokasiAset: "Lemari Kamera A",
      kondisi: "Siap Digunakan",
      pengguna: "John Doe",
      noSN: "SN-98765432",
      spesifikasi: "24.2 MP, 4K HDR, Full-Frame",
      keterangan: "Lengkap dengan strap & charger",
    },
    {
      namaAset: "Godox SL60W LED Video Light",
      jenisAset: "Galeria Studio",
      kategori: "Lighting",
      merek: "Godox",
      model: "SL60W",
      jumlah: 2,
      hargaAset: 1800000,
      tanggalPembelian: "2024-03-20",
      lokasiAset: "Studio 1",
      kondisi: "Siap Digunakan",
      pengguna: "Jane Smith",
      noSN: "",
      spesifikasi: "5600K Daylight, Bowens Mount",
      keterangan: "",
    },
  ];

  await exportToExcel(columns, sampleData, "Template_Import_Aset.xlsx", "Template_Aset");
};

/**
 * Download Template Excel untuk Import Aksesoris
 */
export const downloadAksesorisTemplate = async () => {
  const columns = [
    { header: "Nama Aksesoris", dataKey: "namaAksesoris" },
    { header: "Jenis Brand", dataKey: "jenisAset" },
    { header: "Kategori", dataKey: "kategori" },
    { header: "Merek", dataKey: "merek" },
    { header: "Model", dataKey: "model" },
    { header: "Jumlah Unit", dataKey: "jumlahUnit" },
    { header: "Harga Aset", dataKey: "hargaAset" },
    { header: "Tanggal Pembelian", dataKey: "tanggalPembelian" },
    { header: "Lokasi", dataKey: "lokasi" },
    { header: "Kondisi", dataKey: "kondisi" },
    { header: "Keterangan", dataKey: "keterangan" },
  ];

  const sampleData = [
    {
      namaAksesoris: "Baterai Sony NP-FZ100",
      jenisAset: "Galeria Production",
      kategori: "Baterai",
      merek: "Sony",
      model: "NP-FZ100",
      jumlahUnit: 4,
      hargaAset: 1100000,
      tanggalPembelian: "2024-02-10",
      lokasi: "Kotak Baterai 1",
      kondisi: "Siap Digunakan",
      keterangan: "Baterai cadangan kamera Sony",
    },
    {
      namaAksesoris: "SanDisk Extreme Pro 128GB SDXC",
      jenisAset: "Galeria Production",
      kategori: "Memory Card",
      merek: "SanDisk",
      model: "Extreme Pro",
      jumlahUnit: 3,
      hargaAset: 450000,
      tanggalPembelian: "2024-03-01",
      lokasi: "Kotak SD Card",
      kondisi: "Siap Digunakan",
      keterangan: "Speed 200MB/s V30",
    },
  ];

  await exportToExcel(columns, sampleData, "Template_Import_Aksesoris.xlsx", "Template_Aksesoris");
};

/**
 * Parse file Excel (.xlsx / .xls) menjadi array of objects menggunakan XLSX
 * @param {File} file
 * @returns {Promise<Array>}
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error("File Excel tidak memiliki sheet yang valid.");
        }
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "", raw: false, dateNF: "yyyy-mm-dd" });
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};
