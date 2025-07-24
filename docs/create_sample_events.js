// This script creates a sample event in the database for testing purposes
const { createSampleEvent, testEventsAPI, testCreateEvent, testUpdateEvent } = require('./events_api_test');

// Your school ID from the debug output
const SCHOOL_ID = '682f0b4b324f105f376b617f';

async function createTestEvents() {
    console.log('Checking existing events...');
    const events = await testEventsAPI(SCHOOL_ID);
    
    if (Array.isArray(events) && events.length === 0) {
        console.log('No events found. Creating sample events...');
        
        // Create three sample events with different types
        const event1 = await createSampleEvent(SCHOOL_ID);
        console.log('Created first sample event:', event1);
        
        // Create a holiday event
        const event2 = await createSampleEvent(SCHOOL_ID);
        if (event2) {
            event2.title = 'Sample Holiday';
            event2.eventType = 'Holiday';
            event2.description = 'This is a sample holiday event';
            const updatedEvent = await testUpdateEvent(event2._id, event2);
            console.log('Created holiday event:', updatedEvent);
        }
        
        // Create an exam event for next week
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const weekAfter = new Date();
        weekAfter.setDate(weekAfter.getDate() + 8);
        
        const examEvent = {
            title: 'Sample Exam',
            description: 'This is a sample exam event',
            startDate: nextWeek.toISOString(),
            endDate: weekAfter.toISOString(),
            eventType: 'Exam',
            school: SCHOOL_ID,
            createdBy: 'Test Script'
        };
        
        const event3 = await testCreateEvent(examEvent);
        console.log('Created exam event:', event3);
        
        console.log('All sample events created successfully');
    } else {
        console.log(`Found ${events.length} existing events. No need to create samples.`);
    }
}

// Run the function
createTestEvents().catch(error => {
    console.error('Error creating test events:', error);
});
