// Test script for sending messages
const axios = require('axios');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:5000';
const TEST_SENDER_ID = '6847ce01d11db78e297e1f4d'; // Teacher ID
const TEST_SENDER_MODEL = 'teacher';
const TEST_SENDER_NAME = 'Teacher Name';
const TEST_RECEIVER_ID = '683ebc2cec769c46e6e036b1'; // Admin ID
const TEST_RECEIVER_MODEL = 'admin';
const TEST_RECEIVER_NAME = 'Admin Name';
const TEST_SCHOOL_ID = '683ebc2cec769c46e6e036b0'; // School ID

async function testSendMessage() {
    console.log('=== MESSAGE SENDING TEST ===');
    
    try {
        // Create a test message
        const messageData = {
            sender: {
                id: TEST_SENDER_ID,
                model: TEST_SENDER_MODEL,
                name: TEST_SENDER_NAME
            },
            receiver: {
                id: TEST_RECEIVER_ID,
                model: TEST_RECEIVER_MODEL,
                name: TEST_RECEIVER_NAME
            },
            subject: 'Test Message',
            content: 'This is a test message sent at ' + new Date().toISOString(),
            school: TEST_SCHOOL_ID,
            timestamp: new Date().toISOString()
        };
        
        console.log(`Sending test message from ${TEST_SENDER_MODEL} to ${TEST_RECEIVER_MODEL}`);
        
        // Send the message
        const response = await axios.post(`${BASE_URL}/MessageCreate`, messageData);
        
        console.log('Message sent successfully:');
        console.log('Status:', response.status);
        console.log('Message ID:', response.data._id);
        console.log('Content:', response.data.content);
        
        // Now try to retrieve the message
        console.log('\nRetrieving message conversation:');
        const messagesResponse = await axios.get(`${BASE_URL}/Messages/${TEST_SENDER_ID}/${TEST_SENDER_MODEL}/${TEST_RECEIVER_ID}`);
        
        console.log('Conversation retrieved successfully:');
        console.log('Status:', messagesResponse.status);
        console.log('Messages count:', messagesResponse.data.length);
        console.log('Last message content:', messagesResponse.data[messagesResponse.data.length - 1].content);
        
        return true;
    } catch (error) {
        console.error('ERROR:');
        console.error('Status:', error.response?.status);
        console.error('Message:', error.message);
        console.error('Response data:', error.response?.data);
        return false;
    }
}

// Run the test
testSendMessage().then(success => {
    console.log(`\nTest ${success ? 'PASSED' : 'FAILED'}`);
    process.exit(success ? 0 : 1);
}).catch(err => {
    console.error('Test failed with error:', err.message);
    process.exit(1);
});
