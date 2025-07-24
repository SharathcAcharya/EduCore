// System Health Check
const axios = require('axios');

// Configuration
const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

async function checkSystemHealth() {
  console.log('=== System Health Check ===');
  console.log(`Using server URL: ${baseUrl}`);
  
  let allTestsPassed = true;
  
  try {
    // Test 1: Server health check
    console.log('\nTest 1: Server health check...');
    const healthResponse = await axios.get(`${baseUrl}/health`);
    
    if (healthResponse.data && healthResponse.data.status === 'ok') {
      console.log('✅ Server is healthy');
      console.log('Database status:', healthResponse.data.dbStatus);
    } else {
      console.log('❌ Server health check failed');
      console.log('Response:', JSON.stringify(healthResponse.data, null, 2));
      allTestsPassed = false;
    }
    
    // Test 2: API ping test
    console.log('\nTest 2: API ping test...');
    const pingResponse = await axios.get(`${baseUrl}/ping`);
    
    if (pingResponse.data && pingResponse.data.message === 'pong') {
      console.log('✅ API ping successful');
      console.log('Server time:', pingResponse.data.serverTime);
    } else {
      console.log('❌ API ping failed');
      console.log('Response:', JSON.stringify(pingResponse.data, null, 2));
      allTestsPassed = false;
    }
    
    // Test 3: Student authentication
    console.log('\nTest 3: Student authentication...');
    try {
      const loginResponse = await axios.post(`${baseUrl}/StudentLogin`, {
        rollNum: '01',
        studentName: 'mani',
        password: 'mani@123'
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (loginResponse.data && loginResponse.data._id) {
        console.log('✅ Student authentication successful');
      } else {
        console.log('❌ Student authentication failed');
        console.log('Response:', JSON.stringify(loginResponse.data, null, 2));
        allTestsPassed = false;
      }
    } catch (error) {
      console.log('❌ Student authentication failed');
      console.log('Error:', error.message);
      allTestsPassed = false;
    }
    
    // Test 4: Admin data retrieval
    console.log('\nTest 4: Admin data retrieval...');
    try {
      const adminsResponse = await axios.get(`${baseUrl}/Admins/683ebc2cec769c46e6e036b1`);
      
      if (adminsResponse.data && Array.isArray(adminsResponse.data) && adminsResponse.data.length > 0) {
        console.log('✅ Admin data retrieval successful');
      } else {
        console.log('❌ Admin data retrieval failed');
        console.log('Response:', JSON.stringify(adminsResponse.data, null, 2));
        allTestsPassed = false;
      }
    } catch (error) {
      console.log('❌ Admin data retrieval failed');
      console.log('Error:', error.message);
      allTestsPassed = false;
    }
    
    // Summary
    console.log('\n=== Health Check Summary ===');
    if (allTestsPassed) {
      console.log('✅ All system tests passed');
      console.log('The system appears to be functioning correctly.');
    } else {
      console.log('❌ Some tests failed');
      console.log('Please review the test results above for details.');
    }
    
  } catch (error) {
    console.error('\n❌ Health check failed with error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error message:', error.response.data?.message || 'No message provided');
    }
  }
}

// Run the health check
checkSystemHealth();
