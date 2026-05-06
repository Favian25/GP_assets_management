import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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
 * Export data to Excel using xlsx
 * @param {Array} columns - Array of column objects { header: 'Name', dataKey: 'key' }
 * @param {Array} data - Array of objects matching dataKeys
 * @param {String} filename - Output filename
 */
export const exportToExcel = (columns, data, filename = "Report.xlsx") => {
  // Format data specifically for Excel sheet (map keys to headers)
  const formattedData = data.map(item => {
    const row = {};
    columns.forEach(col => {
      row[col.header] = item[col.dataKey] || "-";
    });
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  
  // Adjust column widths automatically based on headers
  const wscols = columns.map(col => ({ wch: Math.max(col.header.length, 10) }));
  worksheet['!cols'] = wscols;

  XLSX.writeFile(workbook, filename);
};
