// Enhanced Student Login Diagnostic Tool
// This script tests student login functionality and messaging system interactions

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const TEST_CREDENTIALS = [
    { email: 'student1@gmail.com', password: '123456' },
    { email: 'student2@gmail.com', password: '123456' }
];

// Test server health
async function testServerHealth() {
    console.log('\n=== TESTING SERVER HEALTH ===');
    try {
        const response = await axios.get(`${BASE_URL}/health`);
        console.log('Server Health:', response.data);
        return response.data;
    } catch (error) {
        console.error('Server Health Check Failed:', error.message);
        return null;
    }
}

// Test student login
async function testStudentLogin(credentials) {
    console.log(`\n=== TESTING STUDENT LOGIN: ${credentials.email} ===`);
    
    try {
        const response = await axios.post(`${BASE_URL}/StudentLogin`, credentials);
        
        console.log('Login successful:');
        console.log('- Status:', response.status);
        console.log('- Student ID:', response.data._id);
        console.log('- Name:', response.data.name);
        console.log('- Class:', response.data.sclassName ? response.data.sclassName.sclassName : 'Not assigned');
        console.log('- School ID:', typeof response.data.school === 'object' ? response.data.school._id : response.data.school);
        
        return response.data;
    } catch (error) {
        console.error('Login Failed:');
        console.error('- Status:', error.response?.status);
        console.error('- Error:', error.message);
        console.error('- Details:', error.response?.data);
        return null;
    }
}

// Test retrieving inbox for student
async function testStudentInbox(studentId) {
    console.log(`\n=== TESTING STUDENT INBOX: ${studentId} ===`);
    
    try {
        const url = `${BASE_URL}/Inbox/${studentId}/student`;
        console.log('Request URL:', url);
        
        const response = await axios.get(url);
        
        console.log('Inbox retrieved successfully:');
        console.log('- Status:', response.status);
        
        if (Array.isArray(response.data)) {
            console.log('- Messages count:', response.data.length);
            
            if (response.data.length > 0) {
                const unreadCount = response.data.filter(msg => !msg.isRead).length;
                console.log('- Unread messages:', unreadCount);
                
                // Show the last few messages
                console.log('\nRecent messages:');
                const recentMessages = response.data.slice(0, 3);
                recentMessages.forEach((msg, index) => {
                    console.log(`[${index + 1}] From: ${msg.sender.name} (${msg.sender.model})`);
                    console.log(`    Subject: ${msg.subject}`);
                    console.log(`    Read: ${msg.isRead ? 'Yes' : 'No'}`);
                });
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

// Test sending a message from student to admin
async function testSendMessageToAdmin(studentData) {
    console.log('\n=== TESTING SENDING MESSAGE TO ADMIN ===');
    
    try {
        // First, get the admin list
        const schoolId = typeof studentData.school === 'object' ? studentData.school._id : studentData.school;
        
        console.log(`Getting admins for school: ${schoolId}`);
        const adminsResponse = await axios.get(`${BASE_URL}/Admins/${schoolId}`);
        
        if (!Array.isArray(adminsResponse.data) || adminsResponse.data.length === 0) {
            console.error('No admins found for this school');
            return null;
        }
        
        const admin = adminsResponse.data[0];
        console.log(`Selected admin: ${admin.name} (${admin._id})`);
        
        // Prepare message data
        const messageData = {
            sender: {
                id: studentData._id,
                model: 'student',
                name: studentData.name
            },
            receiver: {
                id: admin._id,
                model: 'admin',
                name: admin.name
            },
            subject: 'Test Message from Student Login Diagnostic',
            content: `This is a test message sent at ${new Date().toISOString()} from the diagnostic tool`,
            school: schoolId,
            timestamp: new Date().toISOString()
        };
        
        console.log('Sending message with data:', JSON.stringify(messageData, null, 2));
        
        const response = await axios.post(`${BASE_URL}/MessageCreate`, messageData);
        
        console.log('Message sent successfully:');
        console.log('- Status:', response.status);
        console.log('- Message ID:', response.data._id);
        
        return response.data;
    } catch (error) {
        console.error('Message Sending Failed:');
        console.error('- Status:', error.response?.status);
        console.error('- Error:', error.message);
        console.error('- Details:', error.response?.data);
        return null;
    }
}

// Run all tests
async function runDiagnostics() {
    console.log('===== STUDENT LOGIN AND MESSAGING DIAGNOSTICS =====');
    console.log('Starting diagnostics at:', new Date().toISOString());
    
    // Check API health
    const apiHealth = await testServerHealth();
    
    if (!apiHealth || apiHealth.status !== 'ok') {
        console.error('API is not healthy. Stopping diagnostics.');
        return;
    }
    
    // Test student login
    let studentData = null;
    for (const credentials of TEST_CREDENTIALS) {
        const data = await testStudentLogin(credentials);
        if (data) {
            studentData = data;
            break;
        }
    }
    
    if (!studentData) {
        console.error('All login attempts failed. Stopping diagnostics.');
        return;
    }
    
    // Test student inbox
    await testStudentInbox(studentData._id);
    
    // Test sending a message
    await testSendMessageToAdmin(studentData);
    
    console.log('\n===== DIAGNOSTICS COMPLETE =====');
    console.log('Finished at:', new Date().toISOString());
}

// Run the diagnostics
runDiagnostics().catch(err => {
    console.error('Diagnostics failed with error:', err);
});
