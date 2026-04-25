const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Mengoptimalkan gambar yang diupload
 * @param {string} filePath - Path file asli
 * @param {string} destinationDir - Direktori tujuan
 * @param {string} filename - Nama file (tanpa ekstensi)
 * @returns {Promise<string>} - Nama file yang baru (.webp)
 */
async function optimizeImage(filePath, destinationDir, filename) {
  const newFilename = `${filename.split('.')[0]}.webp`;
  const outputPath = path.join(destinationDir, newFilename);

  try {
    await sharp(filePath)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toFile(outputPath);

    // Hapus file asli jika berbeda dengan file baru
    if (filePath !== outputPath) {
      fs.unlinkSync(filePath);
    }

    return newFilename;
  } catch (error) {
    console.error('Error optimizing image:', error);
    // Jika gagal, biarkan file asli tetap ada (atau kembalikan aslinya)
    return filename;
  }
}

module.exports = { optimizeImage };
