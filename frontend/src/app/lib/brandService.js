import api from "./api";

export async function getAllBrands() {
  const response = await api.get("/brands");
  return response.data.data;
}

export async function createBrand(nama) {
  const response = await api.post("/brands", { nama });
  return response.data.data;
}

export async function deleteBrand(id) {
  const response = await api.delete(`/brands/${id}`);
  return response.data;
}
