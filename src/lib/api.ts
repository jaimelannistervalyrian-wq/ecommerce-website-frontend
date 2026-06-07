import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://ecommerce-website-backend-b4s0.onrender.com/api',
  withCredentials: true,
});

// Interceptor: attach token on every request, reading fresh from localStorage
// This guarantees the header is always set regardless of module init order
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
