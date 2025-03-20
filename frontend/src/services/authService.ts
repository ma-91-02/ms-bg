import api from './api';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

interface LoginRequest {
  username: string;
  password: string;
}

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/api/login', credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const validateToken = async (): Promise<boolean> => {
  try {
    await api.get('/api/admin/validate-token');
    return true;
  } catch (error) {
    return false;
  }
}; 