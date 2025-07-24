// Simple test for message controller fix
const axios = require('axios');

// Use port 5000 since that's what the server is using now
const BASE_URL = 'http://localhost:5000';

async function testMessageEndpoint() {
    console.log('Testing Message Controller Endpoints...');
    
    try {
        // Test the health endpoint first
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('Server health:', healthResponse.data);
        
        // Try to get a non-existent message by ID (should return 404 but not crash)
        try {
            console.log('\nTesting message ID endpoint with valid but non-existent ID:');
            const fakeId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectId format
            const messageResponse = await axios.get(`${BASE_URL}/Message/${fakeId}`);
            console.log('Response:', messageResponse.data);
        } catch (error) {
            console.log('Expected error:', error.response.status, error.response.data);
        }
        
        // Try to get messages between two users
        console.log('\nTesting messages between users endpoint:');
        const userId = '683ebc2cec769c46e6e036b2'; // Example user ID
        const userModel = 'student';
        const receiverId = '683ebc2cec769c46e6e036b1'; // Example receiver ID
        
        const messagesResponse = await axios.get(`${BASE_URL}/Messages/${userId}/${userModel}/${receiverId}`);
        console.log('Messages response status:', messagesResponse.status);
        console.log('Messages count:', Array.isArray(messagesResponse.data) ? messagesResponse.data.length : 'Not an array');
        
        console.log('\nAll tests completed successfully!');
    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testMessageEndpoint();
