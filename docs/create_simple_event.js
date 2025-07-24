// Simple event creation script
const fetch = require('node-fetch');

async function createSimpleEvent() {
    console.log('Creating a simple test event...');
    
    // Default school ID that should work (from the test script)
    const schoolId = '682f0b4b324f105f376b617f';
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const testEvent = {
        title: `Simple Test Event ${today.toLocaleTimeString()}`,
        description: 'This is a simple test event created for verification',
        startDate: today.toISOString(),
        endDate: tomorrow.toISOString(),
        eventType: 'Meeting',
        sclassName: '', // Empty string for "All Classes"
        school: schoolId,
        createdBy: 'Test User'
    };
    
    try {
        console.log('Sending event data:', JSON.stringify(testEvent, null, 2));
        
        const response = await fetch(`http://localhost:5000/api/EventCreate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testEvent),
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Event created successfully!');
            console.log('Response:', result);
            return true;
        } else {
            const error = await response.text();
            console.error(`Error creating event: Server responded with ${response.status}: ${response.statusText}`);
            console.error('Error details:', error);
            return false;
        }
    } catch (error) {
        console.error('Error creating event:', error);
        return false;
    }
}

createSimpleEvent();
