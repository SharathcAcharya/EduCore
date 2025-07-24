// This script tests the Message endpoints in the MERN School Management System
const axios = require('axios');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:5000';

// Test IDs - update these with valid IDs from your database
const TEST_RECEIVER_ID = '683ebc2cec769c46e6e036b1'; // Admin ID
const TEST_SENDER_ID = '6847ce01d11db78e297e1f4d';   // Teacher ID
const TEST_SENDER_MODEL = 'teacher';
const TEST_RECEIVER_MODEL = 'admin';

/**
 * Comprehensive test for the Message endpoints
 */
async function testMessageEndpoints() {
    console.log('=== MESSAGE ENDPOINTS TEST ===');
    
    await testGetMessageById();
    await testGetConversation();
    await testObjectIdValidation();
    
    // Additional tests can be added here
    // await testCreateMessage();
    // await testDeleteMessage();
}

/**
 * Test 1: Test the /Message/:id endpoint with query parameters
 */
async function testGetMessageById() {
    try {
        console.log(`\nTest 1: ${BASE_URL}/Message/${TEST_RECEIVER_ID} with query params`);
        const response = await axios.get(`${BASE_URL}/Message/${TEST_RECEIVER_ID}`, {
            params: {
                currentUserId: TEST_SENDER_ID,
                currentUserModel: TEST_SENDER_MODEL
            }
        });
        
        console.log('SUCCESS:');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data).substring(0, 200) + '...');
        return true;
    } catch (error) {
        console.error('FAILED:');
        console.error('Status:', error.response?.status);
        console.error('Error:', error.message);
        console.error('Response data:', error.response?.data);
        return false;
    }
}

/**
 * Test 2: Test the /Messages/:userId/:userModel/:receiverId endpoint
 */
async function testGetConversation() {
    try {
        console.log(`\nTest 2: ${BASE_URL}/Messages/${TEST_SENDER_ID}/${TEST_SENDER_MODEL}/${TEST_RECEIVER_ID}`);
        const response = await axios.get(`${BASE_URL}/Messages/${TEST_SENDER_ID}/${TEST_SENDER_MODEL}/${TEST_RECEIVER_ID}`);
        
        console.log('SUCCESS:');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data).substring(0, 200) + '...');
        return true;
    } catch (error) {
        console.error('FAILED:');
        console.error('Status:', error.response?.status);
        console.error('Error:', error.message);
        console.error('Response data:', error.response?.data);
        return false;
    }
}

/**
 * Test 3: Validate MongoDB ObjectId handling
 */
async function testObjectIdValidation() {
    console.log('\nTest 3: ObjectId Conversion Test:');
    const testIds = [
        TEST_RECEIVER_ID,
        TEST_SENDER_ID,
        'invalid-id',
        '507f1f77bcf86cd799439011' // Valid format but likely non-existent ID
    ];
    
    testIds.forEach(id => {
        try {
            console.log(`ID: ${id}, isValid: ${mongoose.Types.ObjectId.isValid(id)}`);
        } catch (err) {
            console.log(`ID: ${id}, Error: ${err.message}`);
        }
    });
    
    return true;
}

// Run all tests
testMessageEndpoints().catch(err => {
    console.error('Test failed with error:', err.message);
});
