import api from "@/Lib/axios";

/**
 * Fetch the customer's current active plan + subscription details.
 * GET /customers/:id/current-plan
 */
export const fetchCustomerCurrentPlan = async (customerId) => {
  const res = await api.get(`/customers/${customerId}/current-plan`);
  return res.data;
};

/**
 * Fetch all active vendor plans for the dropdown.
 * GET /plans/
 */
export const fetchVendorPlans = async () => {
  const res = await api.get("/plans/");
  return res.data;
};

/**
 * Submit a subscription renewal (JSON body).
 * POST /customers/:id/renew
 */
export const renewSubscription = async (customerId, data) => {
  const res = await api.post(`/customers/${customerId}/renew`, data);
  return res.data;
};
