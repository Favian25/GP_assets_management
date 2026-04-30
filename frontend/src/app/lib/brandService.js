import api from "./api";

export async function getAllBrands(tipe) {
  const params = tipe ? { tipe } : {};
  const response = await api.get("/brands", { params });
  return response.data.data;
}

export async function createBrand(nama, tipe = "aset") {
  const response = await api.post("/brands", { nama, tipe });
  return response.data.data;
}

export async function deleteBrand(id) {
  const response = await api.delete(`/brands/${id}`);
  return response.data;
}

export async function updateBrand(id, nama) {
  const response = await api.put(`/brands/${id}`, { nama });
  return response.data;
}

