import api from './api';

export interface ContactRequest {
  id: string;
  advertiserName: string;
  advertiserPhone: string;
  requesterName: string;
  requesterPhone: string;
  advertisementId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  advertisement?: {
    id: string;
    name: string;
    documentType: string;
    location: string;
  };
}

export const getAllContactRequests = async (): Promise<ContactRequest[]> => {
  try {
    const response = await api.get<ContactRequest[]>('/api/admin/contact-requests');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPendingContactRequests = async (): Promise<ContactRequest[]> => {
  try {
    const response = await api.get<ContactRequest[]>('/api/admin/contact-requests/pending');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const approveContactRequest = async (id: string): Promise<ContactRequest> => {
  try {
    const response = await api.put<ContactRequest>(`/api/admin/contact-requests/${id}/approve`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const rejectContactRequest = async (id: string): Promise<ContactRequest> => {
  try {
    const response = await api.put<ContactRequest>(`/api/admin/contact-requests/${id}/reject`);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 