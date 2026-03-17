import api from "@/Lib/axios";
import { apiWrapper } from "./apiUtils";

export const getCategories = async () => {
  return apiWrapper(async () => {
    const res = await api.get("/accounting/categories");
    return { data: res.data || [] };
  });
};

export const createCategory = async (data) => {
  return apiWrapper(async () => {
    const res = await api.post("/accounting/categories", data);
    return { data: res.data };
  });
};

export const updateCategory = async (id, data) => {
  return apiWrapper(async () => {
    const res = await api.put(`/accounting/categories/${id}`, data);
    return { data: res.data };
  });
};

export const deleteCategory = async (id) => {
  return apiWrapper(async () => {
    await api.delete(`/accounting/categories/${id}`);
    return { success: true };
  });
};
