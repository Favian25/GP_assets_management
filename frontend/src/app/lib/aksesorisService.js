import api, {
  mapAksesorisToFrontend,
  mapAksesorisToBackend,
  mapAksesorisArrayToFrontend,
} from "./api";

// ============================================================
// Aksesoris Service — Semua operasi CRUD & Search terhadap API
// ============================================================

/**
 * GET semua aksesoris
 * @returns {Promise<Array>} list aksesoris dalam format camelCase
 */
export async function getAllAksesoris() {
  const response = await api.get("/aksesoris");
  return mapAksesorisArrayToFrontend(response.data.data);
}

/**
 * GET aksesoris berdasarkan ID
 * @param {number} id
 * @returns {Promise<Object>} aksesoris dalam format camelCase
 */
export async function getAksesorisById(id) {
  const response = await api.get(`/aksesoris/${id}`);
  return mapAksesorisToFrontend(response.data.data);
}

/**
 * POST buat aksesoris baru
 * @param {Object} data - data aksesoris dalam format camelCase
 * @param {File|null} imageFile - file gambar (opsional)
 * @returns {Promise<Object>} aksesoris yang baru dibuat
 */
export async function createAksesoris(data, imageFile = null) {
  const backendData = mapAksesorisToBackend(data);

  if (imageFile) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(backendData)) {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    }
    formData.append("gambar", imageFile);

    const response = await api.post("/aksesoris", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return mapAksesorisToFrontend(response.data.data);
  }

  const response = await api.post("/aksesoris", backendData);
  return mapAksesorisToFrontend(response.data.data);
}

/**
 * PUT update aksesoris
 * @param {number} id
 * @param {Object} data - data aksesoris dalam format camelCase
 * @param {File|null} imageFile - file gambar baru (opsional)
 * @returns {Promise<Object>} aksesoris yang sudah diupdate
 */
export async function updateAksesoris(id, data, imageFile = null) {
  const backendData = mapAksesorisToBackend(data);

  if (imageFile) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(backendData)) {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    }
    formData.append("gambar", imageFile);

    const response = await api.put(`/aksesoris/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return mapAksesorisToFrontend(response.data.data);
  }

  const response = await api.put(`/aksesoris/${id}`, backendData);
  return mapAksesorisToFrontend(response.data.data);
}

/**
 * DELETE hapus aksesoris
 * @param {number} id
 * @returns {Promise<Object>} response message
 */
export async function deleteAksesoris(id) {
  const response = await api.delete(`/aksesoris/${id}`);
  return response.data;
}

/**
 * PATCH update kondisi aksesoris
 * @param {number} id
 * @param {string} kondisi
 * @returns {Promise<Object>} response message
 */
export async function updateAksesorisKondisi(id, kondisi) {
  const response = await api.patch(`/aksesoris/${id}/kondisi`, { kondisi });
  return response.data;
}

/**
 * SEARCH cari aksesoris berdasarkan keyword
 * @param {string} keyword
 * @returns {Promise<Array>} list aksesoris yang ditemukan
 */
export async function searchAksesoris(keyword) {
  const response = await api.get("/aksesoris/search", {
    params: { q: keyword },
  });
  return mapAksesorisArrayToFrontend(response.data.data);
}
