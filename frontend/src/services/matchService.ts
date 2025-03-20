import api from './api';

export interface Match {
  id: string;
  advertisementId: string;
  matchedAdvertisementId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  advertisement?: {
    id: string;
    name: string;
    documentType: string;
    location: string;
    date: string;
    images?: string[];
  };
  matchedAdvertisement?: {
    id: string;
    name: string;
    documentType: string;
    location: string;
    date: string;
    images?: string[];
  };
}

export const getAllMatches = async (): Promise<Match[]> => {
  try {
    const response = await api.get<Match[]>('/api/admin/matches');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPendingMatches = async (): Promise<Match[]> => {
  try {
    const response = await api.get<Match[]>('/api/admin/matches/pending');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const approveMatch = async (id: string): Promise<Match> => {
  try {
    const response = await api.put<Match>(`/api/admin/matches/${id}/approve`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const rejectMatch = async (id: string): Promise<Match> => {
  try {
    const response = await api.put<Match>(`/api/admin/matches/${id}/reject`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const runMatchingForAll = async (): Promise<Match[]> => {
  try {
    const response = await api.get<Match[]>('/api/admin/matches/run-matching');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const runMatchingForOne = async (advertisementId: string): Promise<Match[]> => {
  try {
    const response = await api.get<Match[]>(`/api/admin/matches/run-matching/${advertisementId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const cleanupDuplicateMatches = async (): Promise<{ removed: number }> => {
  try {
    const response = await api.post<{ removed: number }>('/api/admin/matches/cleanup-duplicates');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMatchHistory = async (): Promise<Match[]> => {
  try {
    const response = await api.get<Match[]>('/api/admin/matches/history');
    return response.data;
  } catch (error) {
    throw error;
  }
}; 