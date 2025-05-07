// src/services/donationCenter.service.ts
import Config from '@/src/Config';
import axios from 'axios';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  city: string;
  state: string;
  coordinates: Coordinates;
}

export interface DonationCenter {
  _id: string;
  name: string;
  address: string;
  contactNumber: string;
  email: string;
  location: Location;
  openingHours: string;
  isVerified: boolean;
  addedBy: string; // ID of the admin
}

export interface DonationCenterPayload {
  name: string;
  address: string;
  contactNumber: string;
  email: string;
  location: Location;
  openingHours: string;
  addedBy: string;
}

const BASE_URL = `${Config.API_URL}/donation-centers`;

export const donationCenterService = {
  getAll: async (): Promise<DonationCenter[]> => {
    const res = await axios.get(`${BASE_URL}/get-all-donation-center`);
    return res.data;
  },

  create: async (data: DonationCenterPayload): Promise<DonationCenter> => {
    const res = await axios.post(`${BASE_URL}/create-donation-center`, data);
    return res.data;
  },

  getById: async (id: string): Promise<DonationCenter> => {
    const res = await axios.get(`${BASE_URL}/get-donation-by-id/${id}`);
    return res.data;
  },

  update: async (id: string, data: DonationCenterPayload): Promise<DonationCenter> => {
    const res = await axios.put(`${BASE_URL}/update-donation-by-id/${id}`, data);
    return res.data;
  },

  remove: async (id: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/delete-donation-by-id/${id}`);
  },
};
