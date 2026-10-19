/**
 * Utility functions for text formatting:
 * - UPPERCASE: All characters uppercase
 * - Sentence case: First letter of each sentence capitalized
 * - Capital Each Word: First letter of each word capitalized
 */

/**
 * Mengubah string menjadi UPPERCASE (semua huruf besar)
 * @param {string} str 
 * @returns {string}
 */
export const toUpperCaseText = (str) => {
  if (!str || typeof str !== "string") return str || "";
  return str.toUpperCase();
};

/**
 * Mengubah string menjadi Sentence case (Huruf pertama kalimat kapital)
 * Contoh: "halo dunia. apa kabar?" -> "Halo dunia. Apa kabar?"
 * @param {string} str 
 * @returns {string}
 */
export const toSentenceCase = (str) => {
  if (!str || typeof str !== "string") return str || "";
  return str
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s*\w|\n\s*\w)/g, (c) => c.toUpperCase());
};

/**
 * Mengubah string menjadi Capital Each Word (Setiap awal kata kapital)
 * Contoh: "budi santoso" -> "Budi Santoso"
 * @param {string} str 
 * @returns {string}
 */
export const toCapitalEachWord = (str) => {
  if (!str || typeof str !== "string") return str || "";
  return str
    .toLowerCase()
    .replace(/(^|[\s\-_/([{"'])\p{L}/gu, (match) => match.toUpperCase());
};
