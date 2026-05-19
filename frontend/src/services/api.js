import axios from 'axios';

// GANTI DENGAN URL RAILWAY ANDA (contoh: 'https://proyek-anda.up.railway.app')
const RAILWAY_URL = 'https://aplikasi-cuti-kampus.up.railway.app'; 

const isProduction = !window.location.hostname.includes('localhost');
const baseURL = isProduction ? `${RAILWAY_URL}/api` : 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
