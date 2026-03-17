import api from "@/Lib/axios";
import { apiWrapper } from "./apiUtils";

export const getProfitSummary = async (params) => {
  return apiWrapper(async () => {
    const res = await api.get("/accounting/reports/profit-summary", { params });
    return { data: res.data };
  });
};

export const getExpenseByCategory = async (params) => {
  return apiWrapper(async () => {
    const res = await api.get("/accounting/reports/expense-by-category", { params });
    return { data: res.data.categories || [] };
  });
};

export const getIncomeVsExpenseTrend = async (params) => {
  return apiWrapper(async () => {
    const res = await api.get("/accounting/reports/income-vs-expense-trend", { params });
    return { data: res.data.trend || [] };
  });
};
