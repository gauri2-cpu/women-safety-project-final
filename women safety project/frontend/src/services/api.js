/**
 * API Service
 * Axios wrapper for backend API calls
 */

import axios from 'axios';
import { getUser } from './storage';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add user ID to all requests
api.interceptors.request.use((config) => {
  const user = getUser();
  if (user && user.id) {
    config.headers['x-user-id'] = user.id;
  }
  return config;
});

// User Authentication APIs
export const guestLogin = async () => {
  const response = await api.post('/users/guest-login');
  return response.data;
};

export const signup = async (userData) => {
  const response = await api.post('/users/signup', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/users/login', credentials);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateProfile = async (userData) => {
  const response = await api.put('/users/profile', userData);
  return response.data;
};

// Contact Management APIs
export const addContact = async (contactData) => {
  const response = await api.post('/contacts', contactData);
  return response.data;
};

export const getContacts = async () => {
  const response = await api.get('/contacts');
  return response.data;
};

export const updateContact = async (contactId, contactData) => {
  const response = await api.put(`/contacts/${contactId}`, contactData);
  return response.data;
};

export const deleteContact = async (contactId) => {
  const response = await api.delete(`/contacts/${contactId}`);
  return response.data;
};

// SOS Alert APIs
export const triggerSOS = async (alertData) => {
  const response = await api.post('/sos/trigger', alertData);
  return response.data;
};

export const prepareWhatsAppBroadcast = async (broadcastData) => {
  const response = await api.post('/sos/prepare-whatsapp-broadcast', broadcastData);
  return response.data;
};

export const logWhatsAppBroadcast = async (logData) => {
  const response = await api.post('/sos/log-whatsapp-broadcast', logData);
  return response.data;
};

export const getAlerts = async (limit = 50) => {
  const response = await api.get(`/sos/alerts?limit=${limit}`);
  return response.data;
};

export const getAlertDetails = async (alertId) => {
  const response = await api.get(`/sos/alerts/${alertId}`);
  return response.data;
};

export const resolveAlert = async (alertId, status) => {
  const response = await api.put(`/sos/alerts/${alertId}/resolve`, { status });
  return response.data;
};

// Health Check
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
