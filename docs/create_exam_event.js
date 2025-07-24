// This script adds an exam event to the database for testing
const { testCreateEvent } = require('./events_api_test');

// Your school ID from the debug output
const SCHOOL_ID = '682f0b4b324f105f376b617f';

async function createExamEvent() {
    // Create an exam event for next week
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const weekAfter = new Date();
    weekAfter.setDate(weekAfter.getDate() + 8);
    
    const examEvent = {
        title: 'Final Semester Exam',
        description: 'End of semester examination for all subjects',
        startDate: nextWeek.toISOString(),
        endDate: weekAfter.toISOString(),
        eventType: 'Exam',
        school: SCHOOL_ID,
        createdBy: 'Admin'
    };
    
    console.log('Creating exam event...');
    const event = await testCreateEvent(examEvent);
    console.log('Created exam event:', event);
}

// Run the function
createExamEvent().catch(error => {
    console.error('Error creating exam event:', error);
});
