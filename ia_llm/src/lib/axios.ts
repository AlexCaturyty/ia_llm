import axios from 'axios';

export const api = axios.create({
  // Coloque exatamente a URL pública que o ngrok gerou para você
  baseURL: 'https://countless-impeach-dropbox.ngrok-free.dev',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Você pode apagar os interceptors se não for usar autenticação agora