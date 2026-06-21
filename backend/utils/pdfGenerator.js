
const path = require('path');
const fs = require('fs');

/**
 * Converts the logo image to a base64 data URI for embedding in the HTML template.
 * This avoids file:// protocol issues in Puppeteer's headless browser.
 */
function getLogoBase64() {
  try {
    const logoPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'LOGO GALERIA KARYA MEDIA - TRANSPARANT WARNA.png');
    const logoBuffer = fs.readFileSync(logoPath);
    return `data:image/png;base64,${logoBuffer.toString('base64')}`;
  } catch (e) {
    console.warn('Logo not found, will use text-only header.');
    return null;
  }
}

/**
 * Formats a date string to Indonesian locale.
 */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' WIB';
}

/**
 * Returns status badge color based on loan status.
 */
function getStatusStyle(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('selesai')) return { bg: '#dcfce7', color: '#166534', border: '#22c55e' };
  if (s.includes('dipinjam')) return { bg: '#dbeafe', color: '#1e40af', border: '#3b82f6' };
  if (s.includes('persetujuan')) return { bg: '#fef9c3', color: '#854d0e', border: '#eab308' };
  if (s.includes('verifikasi')) return { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' };
  return { bg: '#f1f5f9', color: '#334155', border: '#94a3b8' };
}

/**
 * Generates a professional HTML template for a loan transaction.
 * The frontend will print this HTML as a PDF.
 *
 * @param {Object} data - The loan data object from Peminjaman.getById()
 * @returns {string} - HTML string ready for printing
 */
function generateLoanPDF(data) {
  // Use a public URL for the logo since it will be rendered in the browser
  const logoBase64 = getLogoBase64();
  
  // Helper to return color/badge styling based on status
  const statusStyle = getStatusStyle(data.status);

  // Build table rows
  const itemRows = (data.items || []).map((item, idx) => `
    <tr>
      <td style="text-align:center; padding:7px 8px; border-bottom:1px solid #ddd; font-size:12px;">${idx + 1}</td>
      <td style="padding:7px 8px; border-bottom:1px solid #ddd; font-size:12px; font-family:'Courier New',monospace; font-weight:600;">${item.kode_aset || '-'}</td>
      <td style="padding:7px 8px; border-bottom:1px solid #ddd; font-size:12px;">${item.nama_aset || '-'}</td>
      <td style="text-align:center; padding:7px 8px; border-bottom:1px solid #ddd; font-size:12px; font-weight:700;">${item.jumlah}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Montserrat:wght@400;500;600;700;800;900&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    @page {
      size: A4;
      margin: 0;
    }

    body {
      font-family: 'Inter', sans-serif;
      color: #000;
      width: 210mm;
      min-height: 297mm;
      padding: 15mm 15mm 20mm 15mm;
      display: flex;
      flex-direction: column;
      margin: 0 auto;
      background: white;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }

    @media print {
      body {
        box-shadow: none;
        margin: 0;
        min-height: auto;
        height: 297mm;
      }
      .no-print {
        display: none !important;
      }
    }

    .print-btn {
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: #2563eb;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 50px;
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.4), 0 2px 4px -1px rgba(37, 99, 235, 0.2);
      transition: all 0.2s;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .print-btn:hover {
      background: #1d4ed8;
      transform: translateY(-2px);
      box-shadow: 0 6px 8px -1px rgba(37, 99, 235, 0.5), 0 4px 6px -1px rgba(37, 99, 235, 0.3);
    }

    .header {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      margin-bottom: 2px;
      padding-left: 20px;
    }

    .header-logo-block {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
      width: 130px;
    }

    .header-logo {
      height: 76px;
      width: auto;
    }

    .header-text {
      flex: 1;
      padding-top: 1px;
    }

    .brand-name {
      font-family: 'Montserrat', sans-serif;
      font-weight: 900;
      font-size: 18px;
      color: #000;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .header-info {
      font-size: 11px;
      color: #000;
      line-height: 1.6;
    }

    .double-line {
      margin-top: 8px;
      border-top: 2.5px solid #000;
      border-bottom: 1px solid #000;
      padding-top: 2px;
      margin-bottom: 22px;
    }

    .doc-title {
      text-align: center;
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #000;
      margin-bottom: 22px;
      text-transform: uppercase;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 24px;
      margin-bottom: 24px;
    }

    .info-section-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #000;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid #ddd;
    }

    .info-row {
      display: flex;
      font-size: 12px;
      line-height: 1.4;
      margin-bottom: 5px;
    }

    .info-label {
      width: 135px;
      color: #000;
      font-weight: 600;
      flex-shrink: 0;
    }

    .info-value {
      color: #000;
      font-weight: 400;
      flex: 1;
    }

    .status-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: 1.5px solid;
    }

    .table-section-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #000;
      margin-bottom: 8px;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }

    .items-table thead th {
      padding: 8px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #000;
      background: #f5f5f5;
      border-top: 1.5px solid #000;
      border-bottom: 1.5px solid #000;
    }

    .signature-area {
      margin-top: 50px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 40px;
    }

    .sig-block {
      text-align: center;
    }

    .sig-title {
      font-size: 12px;
      color: #000;
      margin-bottom: 55px;
    }

    .sig-name {
      font-size: 12px;
      font-weight: 700;
      color: #000;
      padding-top: 4px;
      display: inline-block;
      min-width: 160px;
    }

  </style>
</head>
<body>

  <!-- ===== HEADER / KOP SURAT ===== -->
  <div class="header">
    <div class="header-logo-block">
      ${logoBase64 ? `<img src="${logoBase64}" class="header-logo" />` : ''}
    </div>
    <div class="header-text">
      <div class="brand-name">CV. GALERIA KARYA MEDIA</div>
      <div class="header-info">
        Perum Puri Kertosari Asri Blok A3, Kertosari – Banyuwangi<br/>
        Telp / WA : 082228177117 | 082234048321<br/>
        Website : www.galeriakaryamedia.com
      </div>
    </div>
  </div>

  <div class="double-line"></div>

  <!-- ===== DOCUMENT TITLE ===== -->
  <div class="doc-title">Bukti Transaksi Peminjaman Aset</div>

  <!-- ===== INFO GRID ===== -->
  <div class="info-grid">
    <div>
      <div class="info-section-title">Detail Peminjaman</div>
      <div class="info-row">
        <span class="info-label">No. Transaksi</span>
        <span class="info-value">: ${data.kode_pinjam}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Nama Peminjam</span>
        <span class="info-value">: ${data.nama_peminjam}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Tanggal Pinjam</span>
        <span class="info-value">: ${formatDate(data.tanggal_peminjaman)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Yang Menyerahkan</span>
        <span class="info-value">: ${data.yang_menyerahkan || '-'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Status</span>
        <span class="info-value">: <span class="status-badge" style="background:${statusStyle.bg}; color:${statusStyle.color}; border-color:${statusStyle.border};">${(data.status || '-').toUpperCase()}</span></span>
      </div>
      <div class="info-row">
        <span class="info-label">Alasan</span>
        <span class="info-value">: ${data.alasan_peminjaman || '-'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Disetujui Oleh</span>
        <span class="info-value">: ${data.approved_by || '-'}</span>
      </div>
    </div>
    <div>
      <div class="info-section-title">Detail Pengembalian</div>
      <div class="info-row">
        <span class="info-label">Tanggal Pengembalian</span>
        <span class="info-value">: ${formatDate(data.tanggal_pengembalian)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Diterima Oleh</span>
        <span class="info-value">: ${data.penerima_aset || '-'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Diverifikasi Oleh</span>
        <span class="info-value">: ${data.return_approved_by || '-'}</span>
      </div>
    </div>
  </div>

  <!-- ===== TABLE ===== -->
  <div class="table-section-title">Daftar Alat yang Dipinjam</div>
  <table class="items-table">
    <thead>
      <tr>
        <th style="width:40px; text-align:center;">No</th>
        <th style="width:130px; text-align:left;">Kode Item</th>
        <th style="text-align:left;">Nama Barang</th>
        <th style="width:50px; text-align:center;">Qty</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <!-- ===== SIGNATURE ===== -->
  <div class="signature-area">
    <div class="sig-block">
      <div class="sig-title">Pihak Peminjam,</div>
      <div class="sig-name">( ............................ )</div>
    </div>
    <div class="sig-block">
      <div class="sig-title">Yang Menyerahkan,</div>
      <div class="sig-name">( ............................ )</div>
    </div>
  </div>

  <button class="print-btn no-print" onclick="window.print()">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
    Cetak / Simpan PDF
  </button>
</body>
</html>`;

  return html;
}

module.exports = { generateLoanPDF };
