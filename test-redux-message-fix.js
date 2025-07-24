// Test script for validating Redux message state fixes
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Sample user IDs for testing - update with real IDs from your system
const TEST_STUDENT = {
    id: '683ebc2cec769c46e6e036b2',
    model: 'student',
    name: 'Test Student'
};

const TEST_TEACHER = {
    id: '6847ce01d11db78e297e1f4d',
    model: 'teacher',
    name: 'Test Teacher'
};

const TEST_SCHOOL_ID = '683ebc2cec769c46e6e036b0';

async function testMessageEndpoints() {
    console.log('=== TESTING MESSAGE ENDPOINT RESPONSES ===\n');
    
    try {
        // Test getSentMessages endpoint
        console.log(`Testing getSentMessages for ${TEST_STUDENT.model} with ID ${TEST_STUDENT.id}`);
        const sentMessagesResponse = await axios.get(`${BASE_URL}/SentMessages/${TEST_STUDENT.id}/${TEST_STUDENT.model}`);
        
        console.log(`Status: ${sentMessagesResponse.status}`);
        
        // Verify it returns an array
        const isArray = Array.isArray(sentMessagesResponse.data);
        console.log(`Returns array: ${isArray}`);
        
        if (!isArray) {
            console.error('ERROR: getSentMessages should return an array, but returned:', typeof sentMessagesResponse.data);
            console.error('Response:', sentMessagesResponse.data);
        } else {
            console.log('getSentMessages test passed ✓');
        }
        
        // Test getInbox endpoint
        console.log(`\nTesting getInbox for ${TEST_STUDENT.model} with ID ${TEST_STUDENT.id}`);
        const inboxResponse = await axios.get(`${BASE_URL}/Inbox/${TEST_STUDENT.id}/${TEST_STUDENT.model}`);
        
        console.log(`Status: ${inboxResponse.status}`);
        
        // Verify it returns an array
        const isInboxArray = Array.isArray(inboxResponse.data);
        console.log(`Returns array: ${isInboxArray}`);
        
        if (!isInboxArray) {
            console.error('ERROR: getInbox should return an array, but returned:', typeof inboxResponse.data);
            console.error('Response:', inboxResponse.data);
        } else {
            console.log('getInbox test passed ✓');
        }
        
        // Test Messages endpoint
        console.log(`\nTesting Messages for ${TEST_STUDENT.model} with ID ${TEST_STUDENT.id} and receiver ${TEST_TEACHER.id}`);
        const messagesResponse = await axios.get(`${BASE_URL}/Messages/${TEST_STUDENT.id}/${TEST_STUDENT.model}/${TEST_TEACHER.id}`);
        
        console.log(`Status: ${messagesResponse.status}`);
        
        // Verify it returns an array
        const isMessagesArray = Array.isArray(messagesResponse.data);
        console.log(`Returns array: ${isMessagesArray}`);
        
        if (!isMessagesArray) {
            console.error('ERROR: Messages should return an array, but returned:', typeof messagesResponse.data);
            console.error('Response:', messagesResponse.data);
        } else {
            console.log('Messages test passed ✓');
        }
        
        // Test sending a message
        console.log('\n=== TESTING MESSAGE CREATION ===\n');
        
        // Create message data
        const messageData = {
            sender: {
                id: TEST_STUDENT.id,
                model: TEST_STUDENT.model,
                name: TEST_STUDENT.name
            },
            receiver: {
                id: TEST_TEACHER.id,
                model: TEST_TEACHER.model,
                name: TEST_TEACHER.name
            },
            subject: 'Test Message from Redux State Fix Test',
            content: `This is a test message sent at ${new Date().toISOString()}`,
            school: TEST_SCHOOL_ID,
            timestamp: new Date().toISOString()
        };
        
        console.log('Sending message...');
        const createResponse = await axios.post(`${BASE_URL}/MessageCreate`, messageData);
        
        console.log(`Status: ${createResponse.status}`);
        console.log(`Message ID: ${createResponse.data._id}`);
        console.log('Message created successfully ✓');
        
        console.log('\nAll tests completed successfully!');
    } catch (error) {
        console.error('Test failed:');
        console.error('Error message:', error.message);
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testMessageEndpoints();
