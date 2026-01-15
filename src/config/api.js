import axios from 'axios';

// ⚠️ REPLACE THIS IP WITH YOUR LAPTOP'S IP ADDRESS FOUND IN STEP 3.1
// If using Android Emulator, you can typically use '10.0.2.2'
// If using Physical Device, use '192.168.1.X' (Your Laptop IP)
const BASE_URL = 'http://10.0.2.2/squadfinder/api'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;