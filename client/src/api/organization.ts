import api from './api';

// Description: Get organization details
// Endpoint: GET /api/organization
// Request: {}
// Response: { id: string, name: string, createdAt: string }
export const getOrganization = async () => {
  try {
    const response = await api.get('/api/organization');
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update organization name
// Endpoint: PUT /api/organization
// Request: { name: string }
// Response: { id: string, name: string, createdAt: string }
export const updateOrganization = async (name: string) => {
  try {
    const response = await api.put('/api/organization', { name });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get organization users
// Endpoint: GET /api/organization/users
// Request: {}
// Response: Array<{ id: string, email: string, role: string, createdAt: string }>
export const getOrganizationUsers = async () => {
  try {
    const response = await api.get('/api/organization/users');
    console.log('API Response from getOrganizationUsers:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getOrganizationUsers:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Create new user in organization
// Endpoint: POST /api/organization/users
// Request: { email: string, password: string, role: string }
// Response: { id: string, email: string, role: string, createdAt: string }
export const createOrganizationUser = async (data: { email: string; password: string; role: string }) => {
  try {
    const response = await api.post('/api/organization/users', data);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update user role
// Endpoint: PUT /api/organization/users/:userId
// Request: { role: string }
// Response: { id: string, email: string, role: string, createdAt: string }
export const updateUserRole = async (userId: string, role: string) => {
  try {
    const response = await api.put(`/api/organization/users/${userId}`, { role });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete user
// Endpoint: DELETE /api/organization/users/:userId
// Request: {}
// Response: { message: string }
export const deleteUser = async (userId: string) => {
  try {
    const response = await api.delete(`/api/organization/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};