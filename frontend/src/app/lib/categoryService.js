import api from "./api";

export async function getAllCategories() {
  const response = await api.get("/categories");
  return response.data.data;
}

export async function createCategory(nama, kodeSingkat) {
  const response = await api.post("/categories", { nama, kode_singkat: kodeSingkat });
  return response.data.data;
}

export async function deleteCategory(id) {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
}
