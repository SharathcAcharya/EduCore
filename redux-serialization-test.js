/**
 * Redux Serialization Test Script
 * 
 * This script tests Redux serialization in various parts of the application.
 * Run it to check if the serialization fixes are working properly.
 */

// Define the serializeError function locally for testing
const serializeError = (error, options = {}) => {
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

// Mock error objects to test serialization
const testErrors = [
  // Axios error with response
  {
    message: 'Request failed with status code 500',
    response: {
      status: 500,
      data: { message: 'Internal server error' }
    }
  },
  // Network error
  {
    message: 'Network Error',
    code: 'ECONNREFUSED'
  },
  // Custom error
  new Error('Custom application error')
];

// Test serialization
console.log('===== REDUX SERIALIZATION TEST =====');
console.log('Testing error serialization for Redux...');

testErrors.forEach((error, index) => {
  console.log(`\nTest Case ${index + 1}:`);
  console.log('Original error:', error);
  
  const serialized = serializeError(error);
  console.log('Serialized error:', serialized);
  
  // Check if the serialized error is JSON serializable
  try {
    const jsonString = JSON.stringify(serialized);
    const deserialized = JSON.parse(jsonString);
    console.log('JSON serialization test: PASSED');
    console.log('Deserialized:', deserialized);
  } catch (e) {
    console.error('JSON serialization test: FAILED');
    console.error('Error:', e.message);
  }
});

// Test school ID extraction
console.log('\n===== SCHOOL ID EXTRACTION TEST =====');
const testUsers = [
  { name: 'User with string ID', school: '123456789012' },
  { name: 'User with object ID', school: { _id: '234567890123', name: 'Test School' } },
  { name: 'Admin user', role: 'Admin', _id: '345678901234' },
  { name: 'Invalid user', school: null }
];

// Import the getSchoolId function dynamically since we're in a Node.js context
const getSchoolId = (user) => {
  if (!user) return null;
  
  if (typeof user.school === 'string') {
    return user.school;
  }
  
  if (user.school && typeof user.school === 'object' && user.school._id) {
    return user.school._id;
  }
  
  if (user.role === 'Admin' && user._id) {
    return user._id;
  }
  
  return null;
};

testUsers.forEach((user, index) => {
  console.log(`\nTest Case ${index + 1}:`);
  console.log('User:', user.name);
  const schoolId = getSchoolId(user);
  console.log('Extracted school ID:', schoolId);
});

console.log('\nTests completed. Check your Redux implementation for serialization issues.');
