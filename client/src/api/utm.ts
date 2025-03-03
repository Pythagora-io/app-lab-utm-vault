import api from './api';
import { UtmDropdownValue } from '@/types/utm';

// Description: Create a new UTM link
// Endpoint: POST /api/utm/links
// Request: { destination: string, medium: string, source: string, campaign: string, term?: string, content?: string }
// Response: { success: boolean, link: UtmLink }
export const createUtmLink = async (data: Omit<UtmLink, 'id' | 'createdAt' | 'createdBy'>) => {
  try {
    const response = await api.post('/api/utm/links', data);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get all UTM links
// Endpoint: GET /api/utm/links
// Request: {}
// Response: { success: boolean, links: UtmLink[] }
export const getUtmLinks = async () => {
  try {
    const response = await api.get('/api/utm/links');
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete a UTM link
// Endpoint: DELETE /api/utm/links/:id
// Request: {}
// Response: { success: boolean }
export const deleteUtmLink = async (id: string) => {
  try {
    const response = await api.delete(`/api/utm/links/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get predefined dropdown values
// Endpoint: GET /api/utm/values
// Request: {}
// Response: { success: boolean, values: UtmDropdownValue[] }
export const getDropdownValues = async () => {
  try {
    const response = await api.get('/api/utm/values');
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Add new dropdown value
// Endpoint: POST /api/utm/values
// Request: { value: string, type: 'medium' | 'source' | 'campaign' }
// Response: { success: boolean, value: UtmDropdownValue }
export const addDropdownValue = async (data: { value: string; type: 'medium' | 'source' | 'campaign' }) => {
  try {
    const response = await api.post('/api/utm/values', data);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Edit dropdown value
// Endpoint: PUT /api/utm/values/:id
// Request: { value: string }
// Response: { success: boolean, value: UtmDropdownValue }
export const editDropdownValue = async (id: string, value: string) => {
  try {
    const response = await api.put(`/api/utm/values/${id}`, { value });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete dropdown value
// Endpoint: DELETE /api/utm/values/:id
// Request: {}
// Response: { success: boolean }
export const deleteDropdownValue = async (id: string) => {
  try {
    const response = await api.delete(`/api/utm/values/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Export UTM links
// Endpoint: POST /api/utm/links/export
// Request: { fileFormat: 'csv' | 'excel', filters?: { medium?: string, source?: string, campaign?: string } }
// Response: File download (CSV or Excel)
export const exportUtmLinks = async (fileFormat: 'csv' | 'excel', filters?: { medium?: string, source?: string, campaign?: string }) => {
  try {
    const response = await api.post('/api/utm/links/export', {
      fileFormat,
      filters
    }, {
      responseType: 'blob'
    });

    // Set correct MIME type based on file format
    const mimeType = fileFormat === 'csv'
      ? 'text/csv'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    // Create blob with correct MIME type
    const blob = new Blob([response.data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `utm_links.${fileFormat === 'excel' ? 'xlsx' : 'csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get dashboard statistics
// Endpoint: GET /api/utm/stats
// Request: {}
// Response: {
//   totalLinks: number,
//   activeCampaigns: number,
//   teamMembers: number,
//   linksLast28Days: number,
//   periodChange: number
// }
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/api/utm/stats');
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};