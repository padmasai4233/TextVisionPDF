import axios from 'axios';
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'https://textvisionpdf-backend.vercel.app/api',
  timeout: 20000
});

export async function generateContent(title, prompt) {
  const res = await API.post('/generate', { title, prompt });
  return res.data;
}

export async function generateQuiz(title, prompt) {
  const res = await API.post('/quiz', { title, prompt });
  return res.data;
}

export async function saveAttempt(payload) {
  const res = await API.post('/saveAttempt', payload);
  return res.data;
}
