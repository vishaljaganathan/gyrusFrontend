import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";
import { getSecureStorage, removeSecureStorage } from "./SecureStore";
export const axiosInstance = axios.create({
  // ========================================
  // IMPORTANT: REPLACE THIS IP ADDRESS!
  // ========================================
  // To find your computer's IP address:
  // 1. Open Command Prompt (cmd)
  // 2. Type: ipconfig
  // 3. Look for "IPv4 Address" under WiFi or Ethernet
  // 4. Replace 192.168.1.50 below with YOUR actual IP
  // 
  // Example IPs: 192.168.1.103, 192.168.0.105, 10.0.0.15
  // Your phone MUST be on the SAME WiFi network!
      // baseURL: "http://192.168.1.103:3000/api/",  // ← Your current IP from Metro bundler
   baseURL:"https://api-v2.gyrusneet.com/api/",
  timeout: 30000, // 30 second timeout
});

axiosInstance.interceptors.request.use(
  async function (config: InternalAxiosRequestConfig) {
    let token = await getSecureStorage("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  function (error: AxiosError) {
    return Promise.reject(error);
  }
);

export const unauthorizedInterceptor = (navigation: any) => (error: any) => {
  const { status } = error.response;
  if (status === 401) {
    removeSecureStorage("token");
    // Unauthorized access, navigate to login screen
    if (navigation && typeof navigation.navigate === "function") {
      navigation.navigate('Login');
    } else {
      console.error("Navigation object is not defined or invalid.");
    }
  }
  return Promise.reject(error);
};

axiosInstance.interceptors.response.use(
  function (response: AxiosResponse) {
    return response;
  },
  (error: AxiosError) => {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Handle specific status codes
        switch (error.response.status) {
          case 400:
            console.error("Bad request: Please check your input.");
            break;
          case 401:
            console.error("Unauthorized: Please log in.");
            break;
          case 406:
            console.error("Please Validate otp.");
            break;
          case 500:
            console.error("Server error: Please try again later.");
            break;
          default:
            console.error("An unexpected error occurred:", error.response.data);
        }
      } else {
        // Network or other error
        console.error("Network error:", error.message);
      }
    } else {
      console.error("An unknown error occurred:", error);
    }

    // Reject the promise so that the calling code can handle it
    return Promise.reject(error);
  }
);
