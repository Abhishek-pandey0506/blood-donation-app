// src/services/admin.service.ts
import Config from '@/src/Config';
import axios from 'axios';

export interface Admin {
  _id: string;
  userId: string; // or optionally: User;
  permissions: string[];
}

export interface AdminPayload {
  userId: string;
  permissions: string[];
}

const BASE_URL = `${Config.API_URL}/admins`;

export const adminService = {
  getAll: async (): Promise<Admin[]> => {
    const res = await axios.get(`${BASE_URL}/get-all`);
    return res.data;
  },

  create: async (data: AdminPayload): Promise<Admin> => {
    const res = await axios.post(`${BASE_URL}/create`, data);
    return res.data;
  },

  getById: async (id: string): Promise<Admin> => {
    const res = await axios.get(`${BASE_URL}/get-by-id/${id}`);
    return res.data;
  },

  update: async (id: string, data: AdminPayload): Promise<Admin> => {
    const res = await axios.put(`${BASE_URL}/update-by-id/${id}`, data);
    return res.data;
  },

  remove: async (id: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/delete-by-id/${id}`);
  },
};
