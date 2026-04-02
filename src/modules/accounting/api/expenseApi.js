import api from "@/Lib/axios";
import { apiWrapper } from "./apiUtils";

export const getExpenses = async (params = {}) => {
  return apiWrapper(async () => {
    // Strip empty strings and nulls — FastAPI's date validator rejects empty strings (causes 422)
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
    );
    const res = await api.get("/accounting/expenses", { params: cleanParams });
    // Normalize: ensure it returns { data, total, page, limit }
    return {
      data: res.data.expenses || [],
      total: res.data.total || 0,
      page: res.data.page || 1,
      limit: res.data.pageSize || 20
    };
  });
};

export const createExpense = async (data) => {
  return apiWrapper(async () => {
    const res = await api.post("/accounting/expenses", data);
    return { data: res.data };
  });
};

export const updateExpense = async (id, data) => {
  return apiWrapper(async () => {
    const res = await api.patch(`/accounting/expenses/${id}`, data);
    return { data: res.data };
  });
};

export const deleteExpense = async (id) => {
  return apiWrapper(async () => {
    await api.delete(`/accounting/expenses/${id}`);
    return { success: true };
  });
};
