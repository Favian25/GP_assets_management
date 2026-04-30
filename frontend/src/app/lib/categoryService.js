import api from "./api";

export async function getAllCategories(tipe) {
  const params = tipe ? { tipe } : {};
  const response = await api.get("/categories", { params });
  return response.data.data;
}

export async function createCategory(nama, kodeSingkat, tipe = "aset") {
  const response = await api.post("/categories", { nama, kode_singkat: kodeSingkat, tipe });
  return response.data.data;
}

export async function deleteCategory(id) {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
}

export async function updateCategory(id, nama, kodeSingkat) {
  const response = await api.put(`/categories/${id}`, { nama, kode_singkat: kodeSingkat });
  return response.data;
}

