// Message System Diagnostics Tool
const axios = require('axios');
const mongoose = require('mongoose');

// Change port to 5001 since that's what the server is using now
const BASE_URL = 'http://localhost:5001';

// Configuration - Update these values as needed
const TEST_CONFIG = {
    student: {
        id: '683ebc2cec769c46e6e036b2', // Example student ID
        model: 'student',
        name: 'Student Name'
    },
    teacher: {
        id: '6847ce01d11db78e297e1f4d', // Example teacher ID
        model: 'teacher',
        name: 'Teacher Name'
    },
    admin: {
        id: '683ebc2cec769c46e6e036b1', // Example admin ID
        model: 'admin',
        name: 'Admin Name'
    },
    school: '683ebc2cec769c46e6e036b0' // Example school ID
};

// Test API health
async function testApiHealth() {
    console.log('\n=== TESTING API HEALTH ===');
    try {
        const response = await axios.get(`${BASE_URL}/health`);
        console.log('API Health:', response.data);
        return response.data;
    } catch (error) {
        console.error('API Health Check Failed:', error.message);
        return null;
    }
}

// Test message creation
async function testCreateMessage(sender, receiver) {
    console.log(`\n=== TESTING MESSAGE CREATION: ${sender.model} to ${receiver.model} ===`);
    
    try {
        const messageData = {
            sender,
            receiver,
            subject: `Test Message from ${sender.model} to ${receiver.model}`,
            content: `This is a test message sent at ${new Date().toISOString()}`,
            school: TEST_CONFIG.school,
            timestamp: new Date().toISOString()
        };
        
        console.log('Sending message with data:', JSON.stringify(messageData, null, 2));
        
        const response = await axios.post(`${BASE_URL}/MessageCreate`, messageData);
        
        console.log('Message created successfully:');
        console.log('- Status:', response.status);
        console.log('- Message ID:', response.data._id);
        console.log('- Content:', response.data.content);
        
        return response.data;
    } catch (error) {
        console.error('Message Creation Failed:');
        console.error('- Status:', error.response?.status);
        console.error('- Error:', error.message);
        console.error('- Details:', error.response?.data);
        return null;
    }
}

// Test getting messages between users
async function testGetMessages(sender, receiver) {
    console.log(`\n=== TESTING GET MESSAGES: ${sender.model} with ${receiver.model} ===`);
    
    try {
        const url = `${BASE_URL}/Messages/${sender.id}/${sender.model}/${receiver.id}`;
        console.log('Request URL:', url);
        
        const response = await axios.get(url);
        
        console.log('Messages retrieved successfully:');
        console.log('- Status:', response.status);
        console.log('- Count:', response.data.length);
        
        if (response.data.length > 0) {
            console.log('- Last message:', {
                from: response.data[response.data.length - 1].sender.name,
                content: response.data[response.data.length - 1].content.substring(0, 50) + '...'
            });
        }
        
        return response.data;
    } catch (error) {
        console.error('Get Messages Failed:');
        console.error('- Status:', error.response?.status);
        console.error('- Error:', error.message);
        console.error('- Details:', error.response?.data);
        return null;
    }
}

// Test the inbox
async function testInbox(user) {
    console.log(`\n=== TESTING INBOX: ${user.model} ===`);
    
    try {
        const url = `${BASE_URL}/Inbox/${user.id}/${user.model}`;
        console.log('Request URL:', url);
        
        const response = await axios.get(url);
        
        console.log('Inbox retrieved successfully:');
        console.log('- Status:', response.status);
        
        if (Array.isArray(response.data)) {
            console.log('- Messages count:', response.data.length);
            
            if (response.data.length > 0) {
                const unreadCount = response.data.filter(msg => !msg.isRead).length;
                console.log('- Unread messages:', unreadCount);
            }
        } else {
            console.log('- Response:', response.data);
        }
        
        return response.data;
    } catch (error) {
        console.error('Inbox Retrieval Failed:');
        console.error('- Status:', error.response?.status);
        console.error('- Error:', error.message);
        console.error('- Details:', error.response?.data);
        return null;
    }
}

// Run all tests
async function runDiagnostics() {
    console.log('===== MESSAGE SYSTEM DIAGNOSTICS =====');
    console.log('Starting diagnostics at:', new Date().toISOString());
    
    // Check API health
    const apiHealth = await testApiHealth();
    
    if (!apiHealth || apiHealth.status !== 'ok') {
        console.error('API is not healthy. Stopping diagnostics.');
        return;
    }
    
    // Test combinations of users sending messages
    const testCombinations = [
        { sender: TEST_CONFIG.student, receiver: TEST_CONFIG.teacher },
        { sender: TEST_CONFIG.student, receiver: TEST_CONFIG.admin },
        { sender: TEST_CONFIG.teacher, receiver: TEST_CONFIG.student },
        { sender: TEST_CONFIG.admin, receiver: TEST_CONFIG.student }
    ];
    
    for (const { sender, receiver } of testCombinations) {
        await testCreateMessage(sender, receiver);
        await testGetMessages(sender, receiver);
    }
    
    // Test inboxes
    await testInbox(TEST_CONFIG.student);
    await testInbox(TEST_CONFIG.teacher);
    await testInbox(TEST_CONFIG.admin);
    
    console.log('\n===== DIAGNOSTICS COMPLETE =====');
    console.log('Finished at:', new Date().toISOString());
}

// Run the diagnostics
runDiagnostics().catch(err => {
    console.error('Diagnostics failed with error:', err);
});
