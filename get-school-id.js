// Get School ID Script
const axios = require('axios');

// Configuration
const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
const studentId = '6847cde8d11db78e297e1f3d'; // Use the student ID from our previous test

async function getValidSchoolId() {
  console.log('=== Get Valid School ID ===');
  console.log(`Using server URL: ${baseUrl}`);
  
  try {
    // Fetch student details to get school ID
    console.log('\nFetching student details...');
    const studentResponse = await axios.get(`${baseUrl}/Student/${studentId}`);
    
    if (studentResponse.data && studentResponse.data.school) {
      console.log('✅ Found student details');
      console.log('Student name:', studentResponse.data.name);
      console.log('School ID:', studentResponse.data.school._id || studentResponse.data.school);
      console.log('School name:', studentResponse.data.school.schoolName || 'Unknown');
      
      return studentResponse.data.school._id || studentResponse.data.school;
    } else {
      console.log('❌ Student details not found or school not available');
      console.log('Response:', JSON.stringify(studentResponse.data, null, 2));
      return null;
    }
  } catch (error) {
    console.error('❌ Failed with error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error message:', error.response.data?.message || 'No message provided');
    }
    return null;
  }
}

// Run the script
getValidSchoolId();
