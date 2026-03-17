import api from "@/Lib/axios";
import { toast } from "sonner";

/**
 * Normalizes API errors into a consistent structure.
 */
export const handleApiError = (error) => {
  const message = error.response?.data?.detail || error.message || "An unexpected error occurred";
  
  // Handle specific status codes if needed
  if (error.response?.status === 401) {
    // Auth errors are handled by axios interceptor auto-refresh, but we might want to log out if refresh fails
    console.error("Authentication required");
  } else if (error.response?.status === 403) {
    toast.error("Permission denied or CSRF session expired.");
  } else if (error.response?.status === 500) {
    toast.error("Server error. Please try again later.");
  } else {
    toast.error(message);
  }
  
  throw new Error(message);
};

/**
 * Wraps an API call with error handling and response normalization.
 */
export const apiWrapper = async (apiFunc) => {
  try {
    const response = await apiFunc();
    return response;
  } catch (error) {
    return handleApiError(error);
  }
};
