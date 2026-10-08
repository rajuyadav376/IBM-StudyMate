import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data)
};

// ─── Subjects ─────────────────────────────────────────────────────────────────
export const subjectsAPI = {
  getAll: () => api.get('/subjects'),
  getOne: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
  addTopic: (id, data) => api.post(`/subjects/${id}/topics`, data)
};

// ─── Study Plans ──────────────────────────────────────────────────────────────
export const studyPlansAPI = {
  getAll: () => api.get('/study-plans'),
  getOne: (id) => api.get(`/study-plans/${id}`),
  create: (data) => api.post('/study-plans', data),
  completeDay: (id, dayIndex) => api.put(`/study-plans/${id}/complete-day`, { dayIndex }),
  delete: (id) => api.delete(`/study-plans/${id}`)
};

// ─── AI ───────────────────────────────────────────────────────────────────────
export const aiAPI = {
  generateStudyPlan: (data) => api.post('/ai/study-plan', data),
  explain: (data) => api.post('/ai/explain', data),
  generateQuiz: (data) => api.post('/ai/quiz', data),
  chat: (message) => api.post('/ai/chat', { message })
};

// ─── Quizzes ──────────────────────────────────────────────────────────────────
export const quizzesAPI = {
  getAll: (params) => api.get('/quizzes', { params }),
  getOne: (id) => api.get(`/quizzes/${id}`),
  submit: (id, data) => api.post(`/quizzes/${id}/submit`, data),
  getAttempts: () => api.get('/quizzes/attempts')
};

// ─── Progress ─────────────────────────────────────────────────────────────────
export const progressAPI = {
  getAll: () => api.get('/progress'),
  getSummary: () => api.get('/progress/summary'),
  update: (data) => api.put('/progress', data),
  getWeakTopics: () => api.get('/progress/weak-topics')
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getActivity: () => api.get('/admin/activity'),
  deactivateUser: (id) => api.put(`/admin/users/${id}/deactivate`)
};

export default api;
