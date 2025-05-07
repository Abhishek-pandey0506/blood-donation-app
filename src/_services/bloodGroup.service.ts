// src/services/bloodGroup.service.ts
import Config from '@/src/Config';
import axios from 'axios';

export interface BloodGroup {
  _id: string;
  type: string;
  description?: string;
  compatibleWith: string[];
}

export interface BloodGroupPayload {
  type: string;
  description?: string;
  compatibleWith: string[];
}

const BASE_URL = `${Config.API_URL}/blood-groups`;

export const bloodGroupService = {
  getAll: async (): Promise<BloodGroup[]> => {
    const res = await axios.get(`${BASE_URL}/get-All-blood-group`);
    return res.data;
  },

  create: async (data: BloodGroupPayload): Promise<BloodGroup> => {
    const res = await axios.post(`${BASE_URL}/create-blood-group`, data);
    return res.data;
  },

  getById: async (id: string): Promise<BloodGroup> => {
    const res = await axios.get(`${BASE_URL}/get-blood-group-by-id/${id}`);
    return res.data;
  },

  update: async (id: string, data: BloodGroupPayload): Promise<BloodGroup> => {
    const res = await axios.put(`${BASE_URL}/update-blood-group-by-id/${id}`, data);
    return res.data;
  },

  remove: async (id: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/delete-blood-group-by-id/${id}`);
  },
};
