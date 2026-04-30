import axios from "axios";

/* =============================
   PRODUCTION + LOCAL FIX
============================= */

const baseURL =
  import.meta.env.VITE_API_URL ||
  "https://fleet-management-api-599u.onrender.com/api";

const api = axios.create({
  baseURL,
});

/* =============================
   TOKEN AUTO ATTACH
============================= */

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =============================
   AUTO LOGOUT IF TOKEN EXPIRED
============================= */

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;