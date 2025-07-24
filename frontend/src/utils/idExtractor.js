/**
 * Safely extracts an ID from an object or returns the original value if it's already an ID
 * @param {Object|string} obj - Object that may contain an _id property or a string ID
 * @returns {string|null} - The extracted ID or null if not found
 */
export const extractId = (obj) => {
    if (!obj) return null;
    
    // If obj is an object with _id property, return that
    if (typeof obj === 'object' && obj !== null && obj._id) {
        return obj._id;
    }
    
    // If obj is already a string (presumably an ID), return as is
    if (typeof obj === 'string') {
        return obj;
    }
    
    // Check for nested school property
    if (typeof obj === 'object' && obj !== null && obj.school) {
        if (typeof obj.school === 'string') return obj.school;
        if (typeof obj.school === 'object' && obj.school._id) return obj.school._id;
    }
    
    console.warn('Could not extract ID from input:', obj);
    return null;
};

/**
 * Safely extracts a school ID from the current user object or other inputs
 * 
 * @param {object} user - The user object to extract school ID from
 * @returns {string|null} The extracted school ID or null if no valid ID could be found
 */
export const extractSchoolId = (user) => {
    if (!user) return null;
    
    // Admin users have their own ID as the school ID
    if (user.role === 'Admin') {
        return user._id;
    }
    
    // Teachers and Students have a school property
    if (user.school) {
        return extractId(user.school);
    }
    
    console.warn('Could not extract school ID from user:', user);
    return null;
};
