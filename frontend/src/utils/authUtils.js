/**
 * Utility functions for authentication and user session management
 */

/**
 * Checks if a user is stored in localStorage and if they should be restored
 * @returns {Object|null} The stored user object or null if no valid user is stored
 */
export const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;
    
    return JSON.parse(storedUser);
  } catch (error) {
    console.error('Error retrieving stored user:', error);
    // If there's an error parsing the stored user, clear it
    localStorage.removeItem('user');
    return null;
  }
};

/**
 * Clears the stored user from localStorage
 */
export const clearStoredUser = () => {
  localStorage.removeItem('user');
};

/**
 * Stores a user in localStorage
 * @param {Object} user - The user object to store
 */
export const storeUser = (user) => {
  if (!user) return;
  
  try {
    localStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error('Error storing user:', error);
  }
};
