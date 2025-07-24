/**
 * Utility functions for event management
 */

/**
 * Validates if a string is a valid MongoDB ObjectID
 * @param {string} id - The ID to validate
 * @returns {boolean} - Whether the ID is valid
 */
export const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  
  // MongoDB ObjectIDs are 24 character hex strings
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Formats a date for display
 * @param {string|Date} dateString - The date to format
 * @returns {string} - Formatted date string
 */
export const formatEventDate = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid date';
  }
};

/**
 * Converts dates in an event object to ISO strings
 * @param {Object} eventData - The event data object
 * @returns {Object} - The event data with formatted dates
 */
export const formatEventDates = (eventData) => {
  const formattedData = { ...eventData };
  
  if (formattedData.startDate instanceof Date) {
    formattedData.startDate = formattedData.startDate.toISOString();
  }
  
  if (formattedData.endDate instanceof Date) {
    formattedData.endDate = formattedData.endDate.toISOString();
  }
  
  return formattedData;
};
