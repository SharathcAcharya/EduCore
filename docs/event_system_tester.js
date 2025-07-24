// Event System Testing Tool
// This script helps verify that events are being properly created and stored in the database

const BASE_URL = 'http://localhost:5000'; // Adjust if your backend runs on a different port

// Create a test event
async function createTestEvent() {
    console.log('Creating test event...');

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // You'll need to provide your own valid school ID and user name
    const schoolId = prompt('Enter your school ID:');
    const userName = prompt('Enter your name:');

    if (!schoolId) {
        console.error('School ID is required');
        return;
    }

    const testEvent = {
        title: `Test Event ${new Date().toISOString()}`,
        description: 'This is a test event created by the diagnostic tool',
        startDate: today.toISOString(),
        endDate: tomorrow.toISOString(),
        eventType: 'Meeting',
        sclassName: '', // Empty string for "All Classes"
        school: schoolId,
        createdBy: userName || 'Test User'
    };

    try {
        const response = await fetch(`${BASE_URL}/api/EventCreate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testEvent)
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Test event created successfully:', result);
        
        // Verify the event was created by fetching it
        await verifyEvent(result._id);
        
        return result;
    } catch (error) {
        console.error('Error creating test event:', error);
    }
}

// Verify an event exists in the database
async function verifyEvent(eventId) {
    if (!eventId) {
        console.error('Event ID is required');
        return;
    }

    console.log(`Verifying event with ID: ${eventId}`);
    
    try {
        // We don't have a direct endpoint to get a single event, so we'll check the server health
        const healthResponse = await fetch(`${BASE_URL}/api/health`);
        if (!healthResponse.ok) {
            console.error('Backend server may not be running properly');
            return;
        }
        
        console.log('Backend server is running. The event was likely created successfully.');
        console.log('To verify, check the events list in the admin dashboard.');
        
    } catch (error) {
        console.error('Error verifying event:', error);
    }
}

// Check server health
async function checkServerHealth() {
    console.log('Checking server health...');
    
    try {
        const response = await fetch(`${BASE_URL}/api/health`);
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Server health check:', result);
        
        return result;
    } catch (error) {
        console.error('Error checking server health:', error);
    }
}

// Run diagnostics
async function runDiagnostics() {
    console.log('Running event system diagnostics...');
    
    // 1. Check server health
    const healthStatus = await checkServerHealth();
    if (!healthStatus) {
        console.error('Cannot proceed with diagnostics: Server is not responding');
        return;
    }
    
    // 2. Create a test event
    const createdEvent = await createTestEvent();
    if (!createdEvent) {
        console.error('Event creation test failed');
    } else {
        console.log('Event creation test passed');
    }
    
    console.log('Diagnostics completed.');
}

// Export functions for use in browser console
window.eventDiagnostics = {
    createTestEvent,
    verifyEvent,
    checkServerHealth,
    runDiagnostics
};

console.log('Event diagnostics loaded. Run window.eventDiagnostics.runDiagnostics() to start diagnostics.');
