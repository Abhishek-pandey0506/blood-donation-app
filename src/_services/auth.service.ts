import Config from "@/src/Config";
import axios, { AxiosResponse } from "axios";

// Define the types for the data object that will be sent in the request body
interface AuthData {
  email: string;
  password: string;
}

// Define the response types for the API responses
interface RegisterResponse {
  message: string;
  user: any; // You can replace 'any' with a specific user type
}

interface LoginResponse {
  token: string;
  user: any; // Replace 'any' with a specific user type if needed
}

// The AuthService object that contains the register and login functions
export const authService = {
  register : async (data: AuthData): Promise<RegisterResponse> => {
    try {
      const response: AxiosResponse<RegisterResponse> = await axios.post(
        `${Config.API_URL}/auth/register`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  },
  login : async (data: AuthData): Promise<LoginResponse> => {
    try {
      const response: AxiosResponse<LoginResponse> = await axios.post(
        `${Config.API_URL}/auth/login`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  }
};


