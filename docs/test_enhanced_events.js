// This script helps test the functionality of the Enhanced Events page

const API_BASE_URL = 'http://localhost:5000/api';

// Test creating different types of events for better visualization
async function createTestEventsSet(schoolId) {
    console.log('Creating a set of test events for visualization and filtering...');
    
    const eventTypes = ['Holiday', 'Exam', 'Meeting', 'Activity', 'Other'];
    const today = new Date();
    
    // Create one event of each type spread across the next 30 days
    for (let i = 0; i < eventTypes.length; i++) {
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + (i * 3)); // Space events every 3 days
        
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1); // 1-day events
        
        const eventData = {
            title: `Test ${eventTypes[i]} Event`,
            description: `This is a test ${eventTypes[i].toLowerCase()} event created for visualization and filtering demonstration.`,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            eventType: eventTypes[i],
            school: schoolId,
            createdBy: 'Test Script'
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/EventCreate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData),
            });
            
            const result = await response.json();
            console.log(`Created ${eventTypes[i]} event:`, result);
        } catch (error) {
            console.error(`Error creating ${eventTypes[i]} event:`, error);
        }
    }
    
    console.log('Test events creation completed');
}

// Test getting all events and verify they're received properly
async function testGetEvents(schoolId) {
    try {
        console.log(`Testing enhanced events API with school ID: ${schoolId}`);
        
        const getEventsResponse = await fetch(`${API_BASE_URL}/Events/${schoolId}`);
        const eventsData = await getEventsResponse.json();
        
        if (!Array.isArray(eventsData)) {
            console.error('Events data is not an array. Response format issue.');
            console.log('Response type:', typeof eventsData);
            console.log('Response value:', eventsData);
            return null;
        }
        
        console.log(`Found ${eventsData.length} events`);
        
        // Group events by type for better visualization
        const eventsByType = {};
        eventsData.forEach(event => {
            if (!eventsByType[event.eventType]) {
                eventsByType[event.eventType] = [];
            }
            eventsByType[event.eventType].push(event);
        });
        
        console.log('Events grouped by type:');
        Object.keys(eventsByType).forEach(type => {
            console.log(`${type}: ${eventsByType[type].length} events`);
        });
        
        return eventsData;
    } catch (error) {
        console.error('Error testing events API:', error);
        return null;
    }
}

// Test the sorting functionality (simulating what the frontend does)
function testSorting(events) {
    if (!events || events.length === 0) {
        console.log('No events to sort');
        return;
    }
    
    console.log('Testing sorting functionality...');
    
    // Sort by start date ascending
    const sortedByDateAsc = [...events].sort((a, b) => {
        return new Date(a.startDate) - new Date(b.startDate);
    });
    
    console.log('First 3 events sorted by start date (ascending):');
    sortedByDateAsc.slice(0, 3).forEach(event => {
        console.log(`- ${event.title} (${new Date(event.startDate).toLocaleDateString()})`);
    });
    
    // Sort by title
    const sortedByTitle = [...events].sort((a, b) => {
        return a.title.localeCompare(b.title);
    });
    
    console.log('First 3 events sorted by title:');
    sortedByTitle.slice(0, 3).forEach(event => {
        console.log(`- ${event.title}`);
    });
}

// Test filtering functionality
function testFiltering(events) {
    if (!events || events.length === 0) {
        console.log('No events to filter');
        return;
    }
    
    console.log('Testing filtering functionality...');
    
    // Filter by type
    const examEvents = events.filter(event => event.eventType === 'Exam');
    console.log(`Found ${examEvents.length} exam events`);
    
    // Filter by search term
    const searchTerm = 'test';
    const searchResults = events.filter(event => 
        event.title.toLowerCase().includes(searchTerm) || 
        event.description.toLowerCase().includes(searchTerm)
    );
    console.log(`Found ${searchResults.length} events matching search term "${searchTerm}"`);
}

// Main test function
async function runTests() {
    // Replace with your school ID
    const SCHOOL_ID = '682f0b4b324f105f376b617f';
    
    console.log('==== ENHANCED EVENTS TESTING ====');
    
    // Get existing events
    const events = await testGetEvents(SCHOOL_ID);
    
    if (!events || events.length < 5) {
        console.log('Not enough test events found. Creating test events...');
        await createTestEventsSet(SCHOOL_ID);
        console.log('Please run this script again to test with the newly created events');
    } else {
        testSorting(events);
        testFiltering(events);
        console.log('All tests completed!');
    }
}

// Run the tests
runTests().catch(error => {
    console.error('Error during tests:', error);
});
