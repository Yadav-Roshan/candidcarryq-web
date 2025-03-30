/**
 * Client-side API utilities for interacting with the backend
 */

// Get auth token from localStorage
const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

// Base URL for API requests
const API_BASE_URL = '/api';

// Generic fetch function with authentication
const fetchWithAuth = async (
  endpoint: string, 
  options: RequestInit = {}
) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  
  const data = isJson ? await response.json() : await response.text();
  
  // Handle non-success responses
  if (!response.ok) {
    const error = new Error(
      isJson && data.message ? data.message : 'API request failed'
    );
    throw Object.assign(error, { response, data });
  }
  
  return data;
};

// API client with methods for different endpoints
const apiClient = {
  // Auth endpoints
  auth: {
    login: (identifier: string, password: string) => 
      fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      }),
    
    register: (userData: any) => 
      fetchWithAuth('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    
    // Store token in localStorage after login/register
    setToken: (token: string) => {
      if (typeof window === 'undefined') return;
      localStorage.setItem('authToken', token);
    },
    
    // Remove token for logout
    clearToken: () => {
      if (typeof window === 'undefined') return;
      localStorage.removeItem('authToken');
    },
  },
  
  // User endpoints
  user: {
    getProfile: () => fetchWithAuth('/user/profile'),
    
    updateProfile: (data: any) => 
      fetchWithAuth('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    updatePassword: (currentPassword: string, newPassword: string) => 
      fetchWithAuth('/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
    
    updateAddress: (addressData: any) => 
      fetchWithAuth('/user/address', {
        method: 'PUT',
        body: JSON.stringify({ address: addressData }),
      }),
  },
  
  // Products endpoints
  products: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return fetchWithAuth(`/products?${queryString}`);
    },
    
    getById: (id: string) => fetchWithAuth(`/products/${id}`),
    
    create: (productData: any) => 
      fetchWithAuth('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      }),
    
    update: (id: string, productData: any) => 
      fetchWithAuth(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      }),
    
    delete: (id: string) => 
      fetchWithAuth(`/products/${id}`, {
        method: 'DELETE',
      }),
  },
  
  // Orders endpoints
  orders: {
    getAll: () => fetchWithAuth('/orders'),
    
    getById: (id: string) => fetchWithAuth(`/orders/${id}`),
    
    create: (orderData: any) => 
      fetchWithAuth('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      }),
    
    updateStatus: (id: string, statusData: any) => 
      fetchWithAuth(`/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(statusData),
      }),
  },
  
  // Announcements endpoints
  announcements: {
    getAll: (includeInactive = false) => 
      fetchWithAuth(`/announcements?all=${includeInactive}`),
    
    getById: (id: string) => fetchWithAuth(`/announcements/${id}`),
    
    create: (data: any) => 
      fetchWithAuth('/announcements', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: string, data: any) => 
      fetchWithAuth(`/announcements/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: string) => 
      fetchWithAuth(`/announcements/${id}`, {
        method: 'DELETE',
      }),
  },
};

export default apiClient;
