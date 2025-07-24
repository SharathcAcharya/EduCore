// This script can be used to test the API endpoints directly from a terminal or browser console
// It helps diagnose issues with the event management functionality

const API_BASE_URL = 'http://localhost:5000/api';

// Debug functions to test API endpoints
const testEventsAPI = async (schoolId) => {
    try {
        console.log(`Testing events API with school ID: ${schoolId}`);
        
        // Test GET events
        const getEventsResponse = await fetch(`${API_BASE_URL}/Events/${schoolId}`);
        const eventsData = await getEventsResponse.json();
        console.log('GET Events response:', eventsData);
        
        if (!Array.isArray(eventsData)) {
            console.error('Events data is not an array. Response format issue.');
            console.log('Response type:', typeof eventsData);
            console.log('Response value:', eventsData);
        } else if (eventsData.length === 0) {
            console.log('No events found. This might be normal if no events have been created yet.');
        }
        
        return eventsData;
    } catch (error) {
        console.error('Error testing events API:', error);
        return null;
    }
};

// Test creating an event
const testCreateEvent = async (eventData) => {
    try {
        console.log('Testing create event API with data:', eventData);
        
        const response = await fetch(`${API_BASE_URL}/EventCreate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData),
        });
        
        const result = await response.json();
        console.log('Create event response:', result);
        return result;
    } catch (error) {
        console.error('Error testing create event API:', error);
        return null;
    }
};

// Test updating an event
const testUpdateEvent = async (eventId, eventData) => {
    try {
        console.log(`Testing update event API for event ID: ${eventId}`);
        console.log('Update data:', eventData);
        
        const response = await fetch(`${API_BASE_URL}/Event/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData),
        });
        
        const result = await response.json();
        console.log('Update event response:', result);
        return result;
    } catch (error) {
        console.error('Error testing update event API:', error);
        return null;
    }
};

// Test deleting an event
const testDeleteEvent = async (eventId) => {
    try {
        console.log(`Testing delete event API for event ID: ${eventId}`);
        
        const response = await fetch(`${API_BASE_URL}/Event/${eventId}`, {
            method: 'DELETE',
        });
        
        const result = await response.json();
        console.log('Delete event response:', result);
        return result;
    } catch (error) {
        console.error('Error testing delete event API:', error);
        return null;
    }
};

// Sample usage:
// 1. Call testEventsAPI with a valid school ID to get all events
// 2. Create a new event with testCreateEvent
// 3. Update the event with testUpdateEvent
// 4. Delete the event with testDeleteEvent

// Example event data
const sampleEventData = {
    title: 'Test Event',
    description: 'This is a test event created via the API',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    eventType: 'Meeting',
    school: '682f0b4b324f105f376b617f', // School ID from debug output
    createdBy: 'API Test'
};

// Helper function to create a sample event with the correct school ID
const createSampleEvent = async (schoolId) => {
    const eventData = {
        ...sampleEventData,
        school: schoolId,
        title: 'Sample Event - ' + new Date().toLocaleString(),
    };
    return await testCreateEvent(eventData);
};

// Usage in browser console:
// 1. Copy this entire file
// 2. Open the browser console on your application
// 3. Paste and execute the code
// 4. Run tests like:
//    - const events = await testEventsAPI('your-school-id');
//    - const newEvent = await testCreateEvent({...sampleEventData, school: 'your-school-id'});
//    - const updatedEvent = await testUpdateEvent(newEvent._id, {...newEvent, title: 'Updated Title'});
//    - const deleteResult = await testDeleteEvent(newEvent._id);

// Export functions for use in other scripts
if (typeof module !== 'undefined') {
    module.exports = {
        testEventsAPI,
        testCreateEvent,
        testUpdateEvent,
        testDeleteEvent,
        createSampleEvent,
        sampleEventData
    };
}
