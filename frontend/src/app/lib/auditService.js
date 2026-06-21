import axios from 'axios';
import { mapAuditLogArrayToFrontend } from './api';

const getBackendURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '');
  }
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:5000`;
  }
  return "http://localhost:5000";
};

const BACKEND_URL = getBackendURL();

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

export const getAuditLogs = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await axios.get(`${BACKEND_URL}/api/audit?${query}`, getAuthHeaders());
    return mapAuditLogArrayToFrontend(res.data.data || []);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Gagal memuat audit log');
  }
};
