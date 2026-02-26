import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

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
