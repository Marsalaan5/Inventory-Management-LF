import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://13.234.253.16:7000/api",

});

axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }


    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    console.log("API Request:", config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (token) {
        console.warn("Token rejected by backend. Consider refreshing token.");
      } else {
        if (!window.location.pathname.includes("/signin")) {
          window.location.replace("/signin");
        }
      }
    }
    return Promise.reject(error);
  }
);

window.addEventListener("storage", (e) => {
  if (e.key === "logout-event") {
    if (!window.location.pathname.includes("/signin")) {
      window.location.replace("/signin");
    }
  }
  if (e.key === "login-event") {
    console.log("Logged in another tab");
  }
});

export default axiosInstance;