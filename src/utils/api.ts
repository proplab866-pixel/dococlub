import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // send cookies if needed
});

// Request interceptor (add auth token, etc. if needed)
api.interceptors.request.use(
  (config) => {
    // Example: Add auth token if available
    // const token = localStorage.getItem('token');
    // if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper to check if a value is a non-null object
function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null;
}

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Standardize error object
    let message = "An unknown error occurred.";
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (typeof data === "string") {
        message = data;
      } else if (isObject(data) && "error" in data) {
        message = (data as { error?: string }).error || message;
      } else if (isObject(data) && "message" in data) {
        message = (data as { message?: string }).message || message;
      }
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject({
      status: error.response?.status,
      message,
      data: error.response?.data,
      original: error,
    });
  }
);

// Generic API request function
export async function apiRequest<T = unknown>(
  method: AxiosRequestConfig["method"],
  url: string,
  options?: AxiosRequestConfig
): Promise<
  | { success: true; data: T }
  | { success: false; error: string; status?: number; data?: unknown }
> {
  try {
    const response = await api.request<T>({
      method,
      url,
      ...options,
    });
    return { success: true, data: response.data };
  } catch (err: unknown) {
    // err is standardized by the interceptor
    if (typeof err === "object" && err !== null && "message" in err) {
      return {
        success: false,
        error:
          (err as { message?: string }).message || "An unknown error occurred.",
        status: (err as { status?: number }).status,
        data: (err as { data?: unknown }).data,
      };
    }
    return {
      success: false,
      error: "An unknown error occurred.",
    };
  }
}

// Utility to format INR currency in Indian style
export function formatINR(amount: number) {
  return amount.toLocaleString("en-IN");
}

// Utility to format date as DD/MM/YYYY and time as HH:MM (24-hour) in Indian format
export function formatDateTimeIndian(date: string | Date) {
  const d = new Date(date);
  const dateStr = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // Use 12-hour format with AM/PM
  });
  return `${dateStr} ${timeStr}`;
}

// Example usage:
// import { apiRequest } from '@/utils/api';
// const data = await apiRequest('get', '/api/v1/get-investment-plans');
// const data = await apiRequest('post', '/api/v1/auth/login', { data: { email, password } });

export default api;
