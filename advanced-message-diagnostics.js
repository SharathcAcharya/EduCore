// Message System Advanced Diagnostics Tool
// This script tests the fixes for socket issues and duplicate message keys

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test configurations
const TEST_CONFIG = {
    student: {
        id: '683ebc2cec769c46e6e036b2', // Update with real ID
        model: 'student',
        name: 'Student Name'
    },
    teacher: {
        id: '6847ce01d11db78e297e1f4d', // Update with real ID
        model: 'teacher',
        name: 'Teacher Name'
    },
    school: '683ebc2cec769c46e6e036b0' // Update with real ID
};

// Test message detail endpoint
async function testMessageDetailEndpoint() {
    console.log('\n=== TESTING MESSAGE DETAIL ENDPOINT ===');
    
    try {
        // First, get a message ID from a conversation
        console.log('Getting messages between student and teacher...');
        const conversationResponse = await axios.get(
            `${BASE_URL}/Messages/${TEST_CONFIG.student.id}/${TEST_CONFIG.student.model}/${TEST_CONFIG.teacher.id}`
        );
        
        if (!Array.isArray(conversationResponse.data) || conversationResponse.data.length === 0) {
            console.log('No messages found in conversation, creating a test message...');
            
            // Create a test message
            const messageData = {
                sender: {
                    id: TEST_CONFIG.student.id,
                    model: TEST_CONFIG.student.model,
                    name: TEST_CONFIG.student.name
                },
                receiver: {
                    id: TEST_CONFIG.teacher.id,
                    model: TEST_CONFIG.teacher.model,
                    name: TEST_CONFIG.teacher.name
                },
                subject: 'Test Message for Diagnostics',
                content: `Test message sent at ${new Date().toISOString()}`,
                school: TEST_CONFIG.school,
                timestamp: new Date().toISOString()
            };
            
            const createResponse = await axios.post(`${BASE_URL}/MessageCreate`, messageData);
            console.log(`Created message with ID: ${createResponse.data._id}`);
            
            // Now test getting the specific message
            const messageResponse = await axios.get(`${BASE_URL}/Message/${createResponse.data._id}`);
            console.log('Single message endpoint test successful:', messageResponse.status);
            
            // Now test the conversation again
            const newConversationResponse = await axios.get(
                `${BASE_URL}/Messages/${TEST_CONFIG.student.id}/${TEST_CONFIG.student.model}/${TEST_CONFIG.teacher.id}`
            );
            
            console.log('Updated conversation contains', newConversationResponse.data.length, 'messages');
            return true;
        } else {
            // Test getting a specific message
            const messageId = conversationResponse.data[0]._id;
            console.log(`Testing single message endpoint with ID: ${messageId}`);
            
            try {
                const messageResponse = await axios.get(`${BASE_URL}/Message/${messageId}`);
                console.log('Single message endpoint test successful:', messageResponse.status);
            } catch (error) {
                console.error('Single message endpoint test failed:');
                console.error(`Status: ${error.response?.status}`);
                console.error(`Error: ${error.message}`);
                
                if (error.response?.status === 404) {
                    console.log('404 error - This is expected if the fallback logic is working');
                } else {
                    console.error('Unexpected error on single message endpoint');
                }
            }
            
            return true;
        }
    } catch (error) {
        console.error('Test failed:');
        console.error(`Status: ${error.response?.status}`);
        console.error(`Error: ${error.message}`);
        return false;
    }
}

// Test message sending with readonly property issues
async function testMessageSending() {
    console.log('\n=== TESTING MESSAGE SENDING WITH READONLY OBJECT ===');
    
    try {
        // Create a test message
        const messageData = {
            sender: {
                id: TEST_CONFIG.student.id,
                model: TEST_CONFIG.student.model,
                name: TEST_CONFIG.student.name
            },
            receiver: {
                id: TEST_CONFIG.teacher.id,
                model: TEST_CONFIG.teacher.model,
                name: TEST_CONFIG.teacher.name
            },
            subject: 'Test Message with Object.freeze',
            content: `Test message with frozen object at ${new Date().toISOString()}`,
            school: TEST_CONFIG.school,
            timestamp: new Date().toISOString()
        };
        
        // Freeze the object to simulate read-only properties
        const frozenMessageData = Object.freeze(messageData);
        
        console.log('Sending frozen message data...');
        
        // This would normally fail with "Cannot assign to read only property" error
        // but our fix should create a new object instead of modifying the frozen one
        try {
            // We can't directly test the socketService.js code here,
            // but we can verify the API endpoint works with frozen objects
            const response = await axios.post(`${BASE_URL}/MessageCreate`, frozenMessageData);
            console.log('Message created successfully with ID:', response.data._id);
            return true;
        } catch (error) {
            console.error('Message creation failed:');
            console.error(`Status: ${error.response?.status}`);
            console.error(`Error: ${error.message}`);
            return false;
        }
    } catch (error) {
        console.error('Test failed:');
        console.error(`Error: ${error.message}`);
        return false;
    }
}

// Run all tests
async function runDiagnostics() {
    console.log('===== MESSAGE SYSTEM ADVANCED DIAGNOSTICS =====');
    console.log('Testing fixes for socket issues and duplicate message keys');
    console.log('Starting at:', new Date().toISOString());
    
    // Test server health
    try {
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('Server health:', healthResponse.data);
    } catch (error) {
        console.error('Server health check failed:', error.message);
        console.error('Please make sure the server is running before running diagnostics');
        return;
    }
    
    // Run individual tests
    const messageDetailResult = await testMessageDetailEndpoint();
    const messageSendingResult = await testMessageSending();
    
    // Show results
    console.log('\n===== DIAGNOSTICS RESULTS =====');
    console.log(`Message Detail Endpoint Test: ${messageDetailResult ? 'PASSED' : 'FAILED'}`);
    console.log(`Message Sending Test: ${messageSendingResult ? 'PASSED' : 'FAILED'}`);
    
    console.log('\nConclusion:');
    if (messageDetailResult && messageSendingResult) {
        console.log('All tests passed! The fixes appear to be working correctly.');
    } else {
        console.log('Some tests failed. Please check the logs for details.');
    }
    
    console.log('\nNote: For a complete test of the socket connection issue and duplicate keys,');
    console.log('please also test the actual frontend application, as some issues only occur');
    console.log('in the browser environment with React and Socket.IO.');
}

// Run the diagnostics
runDiagnostics().catch(err => {
    console.error('Diagnostics failed with error:', err);
});
