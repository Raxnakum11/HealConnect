const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🔧 API_BASE_URL:', API_BASE_URL);
console.log('🔧 Environment Variables:', import.meta.env);

// Token management
class TokenManager {
  static getToken() {
    return localStorage.getItem('authToken');
  }

  static setToken(token) {
    localStorage.setItem('authToken', token);
  }

  static removeToken() {
    localStorage.removeItem('authToken');
  }

  static isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  }
}

// HTTP client with interceptors
class HttpClient {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = TokenManager.getToken();
    
    console.log('🚀 Making API request to:', url);
    console.log('🚀 API_BASE_URL:', API_BASE_URL);
    console.log('🚀 Endpoint:', endpoint);
    console.log('🚀 Request options:', options);
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available and not expired
    if (token && !TokenManager.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      console.log('Response status:', response.status);
      
      // Handle different response scenarios
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
        } catch (jsonError) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || `HTTP error! status: ${response.status}`;
        }
        
        // Handle specific status codes
        if (response.status === 404) {
          throw new Error('API endpoint not found. Please check if the server is running.');
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        } else if (response.status === 401 && errorMessage?.includes('expired')) {
          TokenManager.removeToken();
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Network error. Please check your internet connection and ensure the server is running.');
      }
      throw error;
    }
  }

  static async get(endpoint, params = {}) {
    const searchParams = new URLSearchParams(params);
    const url = searchParams.toString() ? `${endpoint}?${searchParams}` : endpoint;
    return this.request(url);
  }

  static async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

// Authentication API
export class AuthAPI {
  static async login(credentials) {
    const response = await HttpClient.post('/auth/login', credentials);
    if (response.success && response.data.token) {
      TokenManager.setToken(response.data.token);
    }
    return response;
  }

  static async loginWithMobile(mobileNumber, name, role = 'patient') {
    console.log('AuthAPI.loginWithMobile called with:', { mobileNumber, name, role });
    const response = await HttpClient.post('/auth/login', { 
      mobile: mobileNumber, 
      name, 
      role 
    });
    console.log('AuthAPI.loginWithMobile response:', response);
    if (response.success && response.data.token) {
      console.log('Setting token:', response.data.token);
      TokenManager.setToken(response.data.token);
    }
    return response;
  }

  static async loginWithEmail(email, password) {
    console.log('AuthAPI.loginWithEmail called with:', { email });
    const response = await HttpClient.post('/auth/login', { 
      email: email.toLowerCase(), 
      password 
    });
    console.log('AuthAPI.loginWithEmail response:', response);
    if (response.success && response.data.token) {
      console.log('Setting token:', response.data.token);
      TokenManager.setToken(response.data.token);
    }
    return response;
  }

  static async register(userData) {
    const response = await HttpClient.post('/auth/register', userData);
    if (response.success && response.data.token) {
      TokenManager.setToken(response.data.token);
    }
    return response;
  }

  static async logout() {
    try {
      await HttpClient.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error.message);
    } finally {
      TokenManager.removeToken();
    }
  }

  static async getCurrentUser() {
    return HttpClient.get('/auth/me');
  }

  static async updateProfile(profileData) {
    return HttpClient.put('/auth/profile', profileData);
  }

  static async changePassword(passwordData) {
    return HttpClient.put('/auth/change-password', passwordData);
  }

  static isAuthenticated() {
    const token = TokenManager.getToken();
    return token && !TokenManager.isTokenExpired(token);
  }

  static getTokenData() {
    const token = TokenManager.getToken();
    if (!token || TokenManager.isTokenExpired(token)) return null;
    
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      return null;
    }
  }
}

// Patients API
export class PatientsAPI {
  static async getPatients(params = {}) {
    console.log('🔥 PatientsAPI.getPatients called with params:', params);
    const response = await HttpClient.get('/patients', params);
    console.log('🔥 PatientsAPI.getPatients raw response:', response);
    console.log('🔥 Response structure - data:', response.data);
    console.log('🔥 Response structure - patients:', response.data?.patients);
    
    const result = response.data?.patients || response.data || response;
    console.log('🔥 PatientsAPI.getPatients final result:', result);
    return result;
  }

  static async getPatient(id) {
    const response = await HttpClient.get(`/patients/${id}`);
    return response.data?.patient || response.data || response;
  }

  static async createPatient(patientData) {
    const response = await HttpClient.post('/patients', patientData);
    return response.data || response;
  }

  static async updatePatient(id, patientData) {
    const response = await HttpClient.put(`/patients/${id}`, patientData);
    return response.data || response;
  }

  static async deletePatient(id) {
    const response = await HttpClient.delete(`/patients/${id}`);
    return response.data || response;
  }

  static async addVisit(id, visitData) {
    const response = await HttpClient.post(`/patients/${id}/visits`, visitData);
    return response.data || response;
  }

  static async getPatientStats() {
    const response = await HttpClient.get('/patients/stats');
    return response.data || response;
  }

  static async assignPatientToDoctor(patientId) {
    const response = await HttpClient.put(`/patients/${patientId}/assign`);
    return response.data || response;
  }

  static async updatePatientEmail(patientId, email) {
    const response = await HttpClient.put(`/patients/${patientId}/email`, { email });
    return response.data || response;
  }

  static async getPatientVisitHistory(patientId) {
    const response = await HttpClient.get(`/patients/${patientId}/visit-history`);
    return response.data || response;
  }
}

// Medicines API
export class MedicinesAPI {
  static async getMedicines(params = {}) {
    const response = await HttpClient.get('/medicines', params);
    return response.data?.medicines || response.data || response;
  }

  static async getMedicine(id) {
    const response = await HttpClient.get(`/medicines/${id}`);
    return response.data?.medicine || response.data || response;
  }

  static async createMedicine(medicineData) {
    const response = await HttpClient.post('/medicines', medicineData);
    return response.data || response;
  }

  static async updateMedicine(id, medicineData) {
    const response = await HttpClient.put(`/medicines/${id}`, medicineData);
    return response.data || response;
  }

  static async deleteMedicine(id) {
    const response = await HttpClient.delete(`/medicines/${id}`);
    return response.data || response;
  }

  static async updateQuantity(id, quantityData) {
    const response = await HttpClient.patch(`/medicines/${id}/quantity`, quantityData);
    return response.data || response;
  }

  static async getMedicineStats() {
    const response = await HttpClient.get('/medicines/stats');
    return response.data || response;
  }

  static async getExpiringMedicines(days = 30) {
    const response = await HttpClient.get('/medicines/expiring', { days });
    return response.data || response;
  }

  static async importMedicines(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = TokenManager.getToken();
    const url = `${API_BASE_URL}/medicines/import`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Import failed');
    }
    
    return await response.json();
  }
}

// Camps API
export class CampsAPI {
  static async getCamps(params = {}) {
    const response = await HttpClient.get('/camps', params);
    return response.data?.camps || response.data || response;
  }

  static async getCamp(id) {
    const response = await HttpClient.get(`/camps/${id}`);
    return response.data?.camp || response.data || response;
  }

  static async createCamp(campData) {
    const response = await HttpClient.post('/camps', campData);
    return response.data || response;
  }

  static async updateCamp(id, campData) {
    const response = await HttpClient.put(`/camps/${id}`, campData);
    return response.data || response;
  }

  static async deleteCamp(id) {
    const response = await HttpClient.delete(`/camps/${id}`);
    return response.data || response;
  }

  static async completeCamp(id, data = {}) {
    const response = await HttpClient.patch(`/camps/${id}/complete`, data);
    return response.data || response;
  }

  static async addMedicineUsage(id, medicineData) {
    const response = await HttpClient.post(`/camps/${id}/medicines`, medicineData);
    return response.data || response;
  }

  static async getUpcomingCamps() {
    const response = await HttpClient.get('/camps/upcoming');
    return response.data || response;
  }

  static async getCampStats() {
    const response = await HttpClient.get('/camps/stats');
    return response.data || response;
  }
}

// Prescriptions API
export class PrescriptionsAPI {
  static async getPrescriptions(params = {}) {
    return HttpClient.get('/prescriptions', params);
  }

  static async getPrescription(id) {
    return HttpClient.get(`/prescriptions/${id}`);
  }

  static async createPrescription(prescriptionData) {
    return HttpClient.post('/prescriptions', prescriptionData);
  }

  static async updatePrescription(id, prescriptionData) {
    return HttpClient.put(`/prescriptions/${id}`, prescriptionData);
  }

  static async deletePrescription(id) {
    return HttpClient.delete(`/prescriptions/${id}`);
  }

  static async completePrescription(id) {
    return HttpClient.patch(`/prescriptions/${id}/complete`);
  }

  static async getPatientPrescriptions(patientId, params = {}) {
    return HttpClient.get(`/prescriptions/patient/${patientId}`, params);
  }

  static async getPrescriptionStats() {
    return HttpClient.get('/prescriptions/stats');
  }

  static async getMyPrescriptions() {
    return HttpClient.get('/prescriptions/my-prescriptions');
  }
}

// Email Notifications API
export class NotificationsAPI {
  static async sendEmailNotification(patientId, type, data) {
    return HttpClient.post('/notifications/email', {
      patientId,
      type,
      data
    });
  }

  static async sendBulkEmailNotifications(patientIds, type, data) {
    return HttpClient.post('/notifications/email/bulk', {
      patientIds,
      type,
      data
    });
  }

  static async testEmailConfiguration(testEmail) {
    return HttpClient.post('/notifications/email/test', {
      testEmail
    });
  }

  static async getEmailHistory() {
    return HttpClient.get('/notifications/email/history');
  }
}

// Appointments API
export class AppointmentsAPI {
  static async getAppointments(params = {}) {
    return HttpClient.get('/appointments', params);
  }

  static async getAppointment(id) {
    return HttpClient.get(`/appointments/${id}`);
  }

  static async createAppointment(appointmentData) {
    return HttpClient.post('/appointments', appointmentData);
  }

  static async updateAppointmentStatus(id, status, notes = '') {
    return HttpClient.put(`/appointments/${id}/status`, { status, notes });
  }

  static async deleteAppointment(id) {
    return HttpClient.delete(`/appointments/${id}`);
  }

  static async cancelAppointment(id, cancelReason = '') {
    return HttpClient.put(`/appointments/${id}/cancel`, { cancelReason });
  }

  static async getAvailableSlots(doctorId, date) {
    return HttpClient.get(`/appointments/slots/${doctorId}/${date}`);
  }

  static async getAppointmentStats() {
    return HttpClient.get('/appointments/stats');
  }
}

// Export all APIs
export { TokenManager, HttpClient };

// Main API object
export const api = {
  auth: AuthAPI,
  patients: PatientsAPI,
  medicines: MedicinesAPI,
  camps: CampsAPI,
  prescriptions: PrescriptionsAPI,
  notifications: NotificationsAPI,
  appointments: AppointmentsAPI,
  
  // Convenience methods for backward compatibility
  async getAppointments(params = {}) {
    const response = await AppointmentsAPI.getAppointments(params);
    console.log('API getAppointments response:', response);
    return response;
  },
  
  async createAppointment(appointmentData) {
    return AppointmentsAPI.createAppointment(appointmentData);
  },
  
  async updateAppointmentStatus(id, status, notes = '') {
    return AppointmentsAPI.updateAppointmentStatus(id, status, notes);
  },
  
  async deleteAppointment(id) {
    return AppointmentsAPI.deleteAppointment(id);
  },
  
  async cancelAppointment(id, cancelReason = '') {
    return AppointmentsAPI.cancelAppointment(id, cancelReason);
  }
};

// Default export for convenience
export default api;