import axios from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api.config";
import type { AuthResponse, LoginCredentials, RegisterCredentials, User, ApiResponse } from "@/types";

export const authService = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await axios.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.auth.register,
      credentials
    );
    return response.data.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.auth.login,
      credentials
    );
    return response.data.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await axios.get<ApiResponse<{ user: User }>>(API_ENDPOINTS.auth.me);
    return response.data.data.user;
  },

  logout(): void {
    // Clear token from localStorage (handled by axios interceptor)
    localStorage.removeItem("resume_builder_token");
  },
};
