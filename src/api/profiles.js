import api from './client';

export const getWorkersDirectory = () => api.get('/profiles/workers');

export const getWorkerProfile = (workerId) => api.get(`/profiles/workers/${workerId}`);

export const createPerformanceReview = (payload) =>
  api.post('/profiles/performance-reviews', payload);

export const updatePerformanceReview = (reviewId, payload) =>
  api.put(`/profiles/performance-reviews/${reviewId}`, payload);

export const deletePerformanceReview = (reviewId) =>
  api.delete(`/profiles/performance-reviews/${reviewId}`);
