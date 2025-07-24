/**
 * Utility function to serialize errors for Redux
 * This helps ensure consistency in error handling across the application
 * and prevents non-serializable errors from entering Redux state
 * 
 * @param {Error} error - The error object to serialize
 * @param {Object} options - Additional options for error serialization
 * @returns {Object} A serialized error object safe for Redux
 */
export const serializeError = (error, options = {}) => {
  // If already serialized or simple object, return as is
  if (!error || typeof error !== 'object' || !error.message) {
    return error || { message: 'Unknown error occurred' };
  }

  // Create a serialized error object with common properties
  const serializedError = {
    message: error.message || 'An error occurred',
    code: error.code || options.code || 'UNKNOWN_ERROR',
    status: error.response?.status || options.status,
  };

  // Add any additional properties from options
  if (options.additional) {
    Object.assign(serializedError, options.additional);
  }

  // Add response data if available
  if (error.response?.data) {
    serializedError.data = typeof error.response.data === 'object' 
      ? { ...error.response.data }  // Copy to avoid reference issues
      : error.response.data;        // Use as is if not an object
  }

  return serializedError;
};

/**
 * Function to safely extract school ID from user object
 * Handles both string IDs and object references
 * 
 * @param {Object} user - The user object containing school information
 * @returns {String|null} The school ID as a string, or null if not found
 */
export const getSchoolId = (user) => {
  if (!user) return null;
  
  if (typeof user.school === 'string') {
    return user.school;
  }
  
  if (user.school && typeof user.school === 'object' && user.school._id) {
    return user.school._id;
  }
  
  // For admin users, their own ID is their school ID
  if (user.role === 'Admin' && user._id) {
    return user._id;
  }
  
  return null;
};
