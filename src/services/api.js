// Simple API service
const API_BASE_URL = 'https://patient-management-system-in-python.onrender.com/';

export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  const data = await response.json();
  localStorage.setItem('token', data.access_token);
  return data;
};

export const createDemoAccount = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/demo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Demo account creation failed');
  }
  
  const data = await response.json();
  localStorage.setItem('token', data.access_token);
  return data;
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to get user');
  }
  
  return response.json();
};

export default {
  login,
  createDemoAccount,
  getCurrentUser,
};