import Config from '@/src/Config';
import axios from 'axios';

export interface Donation {
  _id: string;
  donorId: string; // or object if populated
  donationDate: string;
  bloodType: string;
  centerId: string; // or object if populated
  volume: number;
  verified: boolean;
}

export interface DonationPayload {
  donorId: string;
  donationDate?: string; // optional - backend defaults to now
  bloodType: string;
  centerId: string;
  volume: number;
  verified?: boolean;
}

const BASE_URL = `${Config.API_URL}/donations`;

export const donationService = {
  getAll: async (): Promise<Donation[]> => {
    const res = await axios.get(`${BASE_URL}/get-all-donation-details`);
    return res.data;
  },

  create: async (data: DonationPayload): Promise<Donation> => {
    const res = await axios.post(`${BASE_URL}/create-donation-details`, data);
    return res.data;
  },

  getById: async (id: string): Promise<Donation> => {
    const res = await axios.get(`${BASE_URL}/get-donation-details-by-id/${id}`);
    return res.data;
  },

  update: async (id: string, data: DonationPayload): Promise<Donation> => {
    const res = await axios.put(`${BASE_URL}/update-donation-details-by-id/${id}`, data);
    return res.data;
  },

  remove: async (id: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/delete-donation-details-by-id/${id}`);
  },
};
