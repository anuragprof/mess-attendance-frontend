import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export const registerCustomer = async (formData) => {
  const response = await axios.post(
    `${API_BASE_URL}/customers/register`,
    formData,
    {
      withCredentials: true, // 🔒 send vendor cookies
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
