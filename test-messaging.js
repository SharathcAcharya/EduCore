// Messaging Component Test Script
const axios = require('axios');

// Configuration
const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
const studentId = '6847cde8d11db78e297e1f3d'; // Use the student ID from our previous test
const schoolId = '683ebc2cec769c46e6e036b1'; // School ID from get-school-id.js

async function testMessagingSystem() {
  console.log('=== Messaging System Test ===');
  console.log(`Using server URL: ${baseUrl}`);
  
  try {
    // Test 1: Check if we can get admins
    console.log('\nTest 1: Fetching admins...');
    const adminsResponse = await axios.get(`${baseUrl}/Admins/${schoolId}`);
    
    if (adminsResponse.data && Array.isArray(adminsResponse.data) && adminsResponse.data.length > 0) {
      console.log('✅ Successfully retrieved admins');
      console.log(`Found ${adminsResponse.data.length} admin(s)`);
    } else {
      console.log('❌ No admins found or unexpected response format');
      console.log('Response:', JSON.stringify(adminsResponse.data, null, 2));
    }
    
    // Test 2: Check student inbox
    console.log('\nTest 2: Fetching student inbox...');
    const inboxResponse = await axios.get(`${baseUrl}/Inbox/${studentId}/student`);
    
    if (inboxResponse.data) {
      console.log('✅ Successfully retrieved student inbox');
      console.log(`Found ${inboxResponse.data.length || 0} messages`);
    } else {
      console.log('❌ Failed to retrieve student inbox');
      console.log('Response:', JSON.stringify(inboxResponse.data, null, 2));
    }
    
    console.log('\nMessaging system test completed.');
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error message:', error.response.data?.message || 'No message provided');
    }
  }
}

// Run the tests
testMessagingSystem();
