/**
 * Analytics System Test Utility
 * 
 * This script helps test and verify fixes to the analytics system
 * by testing the data loading process and school ID extraction.
 */

const axios = require('axios');
const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

/**
 * Extracts the school ID from a user object
 * @param {Object} user - User object
 * @returns {String|null} - School ID or null
 */
const extractSchoolId = (user) => {
  if (!user) return null;
  
  // Admin's ID is the school ID
  if (user.role === 'Admin') {
    return user._id;
  }
  
  // Teachers and Students have a school property
  if (user.school) {
    if (typeof user.school === 'string') return user.school;
    if (typeof user.school === 'object' && user.school._id) return user.school._id;
  }
  
  return null;
};

/**
 * Tests loading analytics data for a specific school
 */
async function testAnalyticsDataLoading(schoolId) {
  if (!schoolId) {
    console.error('No school ID provided');
    return;
  }
  
  console.log(`Testing analytics data loading for school: ${schoolId}`);
  
  try {
    // Test loading students
    console.log(`Fetching students for school ${schoolId}...`);
    const studentsResponse = await axios.get(`${BASE_URL}/Students/${schoolId}`);
    console.log(`Found ${studentsResponse.data.length} students`);
    
    // Test loading teachers
    console.log(`Fetching teachers for school ${schoolId}...`);
    const teachersResponse = await axios.get(`${BASE_URL}/Teachers/${schoolId}`);
    console.log(`Found ${teachersResponse.data.length} teachers`);
    
    // Test loading classes
    console.log(`Fetching classes for school ${schoolId}...`);
    const classesResponse = await axios.get(`${BASE_URL}/SclassList/${schoolId}`);
    console.log(`Found ${classesResponse.data.length} classes`);
    
    // Test loading subjects
    console.log(`Fetching subjects for school ${schoolId}...`);
    const subjectsResponse = await axios.get(`${BASE_URL}/subject/school/${schoolId}`);
    console.log(`Found ${subjectsResponse.data.length} subjects`);
    
    // Test loading assignments
    console.log(`Fetching assignments for school ${schoolId}...`);
    const assignmentsResponse = await axios.get(`${BASE_URL}/Assignments/${schoolId}`);
    console.log(`Found ${assignmentsResponse.data.length} assignments`);
    
    // Test loading events
    console.log(`Fetching events for school ${schoolId}...`);
    const eventsResponse = await axios.get(`${BASE_URL}/Events/${schoolId}`);
    console.log(`Found ${eventsResponse.data.length} events`);
    
    console.log('All data loaded successfully');
    return {
      students: studentsResponse.data,
      teachers: teachersResponse.data,
      classes: classesResponse.data,
      subjects: subjectsResponse.data,
      assignments: assignmentsResponse.data,
      events: eventsResponse.data
    };
  } catch (error) {
    console.error('Error loading analytics data:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

/**
 * Tests login and retrieves the school ID
 */
async function testLoginAndGetSchoolId(email, password, role = 'Admin') {
  try {
    console.log(`Logging in as ${role} with email: ${email}`);
    const loginResponse = await axios.post(`${BASE_URL}/login/Admin`, { email, password });
    
    if (loginResponse.data.message) {
      console.error('Login failed:', loginResponse.data.message);
      return null;
    }
    
    const user = loginResponse.data;
    console.log('Login successful:', user.name);
    
    const schoolId = extractSchoolId(user);
    console.log(`Extracted school ID: ${schoolId}`);
    
    return schoolId;
  } catch (error) {
    console.error('Error during login:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

// Main function to run the tests
async function runTests() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node analytics_test.js <schoolId>');
    console.log('   OR: node analytics_test.js login <email> <password> [role]');
    return;
  }
  
  if (args[0] === 'login') {
    if (args.length < 3) {
      console.log('Usage: node analytics_test.js login <email> <password> [role]');
      return;
    }
    
    const email = args[1];
    const password = args[2];
    const role = args.length > 3 ? args[3] : 'Admin';
    
    const schoolId = await testLoginAndGetSchoolId(email, password, role);
    if (schoolId) {
      await testAnalyticsDataLoading(schoolId);
    }
  } else {
    const schoolId = args[0];
    await testAnalyticsDataLoading(schoolId);
  }
}

// Run the tests if called directly
if (require.main === module) {
  runTests();
}

module.exports = {
  extractSchoolId,
  testAnalyticsDataLoading,
  testLoginAndGetSchoolId
};
