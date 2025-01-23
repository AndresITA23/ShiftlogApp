import axios from 'axios';

const API_URL = 'https://your-backend.com/api'; // Replace with your actual backend URL

export const handleShift = async (token, shiftData) => {
  try {
    const response = await axios.post(`${API_URL}/shift`, shiftData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Error handling shift';
  }
};

export const getShifts = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/shifts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Error fetching shifts';
  }
};
