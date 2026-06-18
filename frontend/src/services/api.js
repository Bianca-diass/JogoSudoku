import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  //withCredentials: true, // útil para Sanctum com cookie HttpOnly
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Não autenticado');
    }

    if (error.response?.status === 403) {
      console.error('Sem permissão');
    }

    if (error.response?.status >= 500) {
      console.error('Erro interno do servidor');
    }

    return Promise.reject(error);
  }
);

export default api;