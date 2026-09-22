import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar token Bearer automáticamente en cada solicitud
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token_clinica');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para redirección al login en caso de 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si expira la sesión, limpiar almacenamiento y forzar recarga
      localStorage.removeItem('token_clinica');
      localStorage.removeItem('usuario_clinica');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
