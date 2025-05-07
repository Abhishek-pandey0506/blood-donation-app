// src/services/donor.service.ts
import Config from '@/src/Config';
import axios from 'axios';

export interface Donor {
  _id: string;
  userId: string; // or optionally: User;
  bloodType: string;
  lastDonationDate: Date;
  location: string;
  age: number;
  gender: string;
  eligibleToDonate: boolean;
}

export interface DonorPayload {
  userId: string;
  bloodType: string;
  lastDonationDate?: Date;
  location: string;
  age: number;
  gender: string;
  eligibleToDonate?: boolean;
}

const BASE_URL = `${Config.API_URL}/donors`;

export const donorService = {
  getAll: async (): Promise<Donor[]> => {
    const res = await axios.get(`${BASE_URL}/get-all-donors`);
    return res.data;
  },

  create: async (data: DonorPayload): Promise<Donor> => {
    const res = await axios.post(`${BASE_URL}/create-donor`, data);
    return res.data;
  },

  getById: async (id: string): Promise<Donor> => {
    const res = await axios.get(`${BASE_URL}/get-donor/${id}`);
    return res.data;
  },

  update: async (id: string, data: DonorPayload): Promise<Donor> => {
    const res = await axios.put(`${BASE_URL}/update-donor/${id}`, data);
    return res.data;
  },

  remove: async (id: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/delete-donor/${id}`);
  },
};
