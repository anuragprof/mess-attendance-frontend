import api from "@/Lib/axios";

/**
 * Record a new customer payment.
 * POST /payments/
 */
export const recordPayment = async (data) => {
  const res = await api.post("/payments/", data);
  return res.data;
};

/**
 * Fetch the 10 most recent payments across all customers.
 * GET /payments/recent
 */
export const getRecentPayments = async () => {
  const res = await api.get("/payments/recent");
  return res.data;
};
