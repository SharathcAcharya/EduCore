// File: verifyConfig.js - Place in frontend/src directory
import { BASE_URL } from './config';

console.log('--------------------------------------');
console.log('Current Backend API URL:', BASE_URL);
console.log('--------------------------------------');

// Export a function to check the connection
export const checkBackendConnection = async () => {
  try {
    const response = await fetch(`${BASE_URL}/ping`);
    if (response.ok) {
      console.log('Backend connection successful!');
      return true;
    } else {
      console.error('Backend connection failed. Status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Backend connection error:', error.message);
    return false;
  }
};

// Call the function to check on import
checkBackendConnection();
