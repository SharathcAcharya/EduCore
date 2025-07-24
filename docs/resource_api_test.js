// Resource API Test Script
// This script tests the ability to create, fetch, and manage learning resources
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testResourceAPI() {
    console.log('Starting resource API tests...');
    
    // Default school ID (from our previous tests)
    const schoolId = '682f0b4b324f105f376b617f';
    
    // 1. Test health check
    try {
        console.log('1. Testing API health...');
        const healthResponse = await fetch(`${BASE_URL}/api/health`);
        const healthData = await healthResponse.json();
        console.log('Health check response:', healthData);
        
        if (!healthResponse.ok) {
            throw new Error(`Server responded with ${healthResponse.status}: ${healthResponse.statusText}`);
        }
    } catch (error) {
        console.error('Health check failed:', error);
        return;
    }
    
    // 2. Create a test resource
    let createdResource;
    try {
        console.log('\n2. Creating test resource...');
        
        const testResource = {
            title: `Test Resource ${new Date().toLocaleTimeString()}`,
            description: 'This is a test learning resource created by the diagnostic script',
            resourceType: 'Document',
            fileUrl: 'https://example.com/test-document.pdf',
            school: schoolId,
            uploadedBy: schoolId, // Admin ID
            uploaderModel: 'admin'
        };
        
        console.log('Resource data:', testResource);
        
        const createResponse = await fetch(`${BASE_URL}/api/ResourceCreate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testResource),
        });
        
        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            throw new Error(`Server responded with ${createResponse.status}: ${errorText}`);
        }
        
        createdResource = await createResponse.json();
        console.log('Resource created successfully:', createdResource);
    } catch (error) {
        console.error('Resource creation failed:', error);
    }
    
    // 3. Fetch all resources
    try {
        console.log('\n3. Fetching all resources...');
        
        const fetchResponse = await fetch(`${BASE_URL}/api/Resources/${schoolId}`);
        
        if (!fetchResponse.ok) {
            const errorText = await fetchResponse.text();
            throw new Error(`Server responded with ${fetchResponse.status}: ${errorText}`);
        }
        
        const resources = await fetchResponse.json();
        console.log(`Retrieved ${resources.length} resources`);
        
        if (resources.length > 0) {
            console.log('First resource:', resources[0]);
        }
    } catch (error) {
        console.error('Failed to fetch resources:', error);
    }
    
    // 4. Delete the created resource (if available)
    if (createdResource && createdResource._id) {
        try {
            console.log('\n4. Deleting test resource...');
            
            const deleteResponse = await fetch(`${BASE_URL}/api/Resource/${createdResource._id}`, {
                method: 'DELETE',
            });
            
            if (!deleteResponse.ok) {
                const errorText = await deleteResponse.text();
                throw new Error(`Server responded with ${deleteResponse.status}: ${errorText}`);
            }
            
            const deleteResult = await deleteResponse.json();
            console.log('Resource deleted successfully:', deleteResult);
        } catch (error) {
            console.error('Failed to delete resource:', error);
        }
    }
    
    console.log('\nResource API tests completed');
}

testResourceAPI();
