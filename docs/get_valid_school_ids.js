// This script helps fetch valid school IDs from the database
const fetch = require('node-fetch');

async function getExistingSchoolIds() {
    try {
        // Try to get a list of admin users to find school IDs
        const response = await fetch('http://localhost:5000/api/health');
        const health = await response.json();
        
        console.log('Server health check:', health);
        
        // First try to get events, which contain school IDs
        const eventsResponse = await fetch('http://localhost:5000/api/Events/all');
        const events = await eventsResponse.json();
        
        if (events && events.length > 0) {
            console.log('Found events:', events.length);
            
            // Extract unique school IDs
            const schoolIds = [...new Set(events.map(event => event.school))];
            console.log('Unique school IDs from events:', schoolIds);
            
            // Show a sample event
            if (events[0]) {
                console.log('Sample event:');
                console.log(JSON.stringify(events[0], null, 2));
            }
            
            return schoolIds;
        } else {
            console.log('No events found, trying to get admin users...');
            
            // If no events, try to get admin users
            const adminsResponse = await fetch('http://localhost:5000/api/admins');
            const admins = await adminsResponse.json();
            
            if (admins && admins.length > 0) {
                console.log('Found admin users:', admins.length);
                // Admin IDs are typically school IDs
                const adminIds = admins.map(admin => admin._id);
                console.log('Admin IDs (can be used as school IDs):', adminIds);
                
                return adminIds;
            }
        }
        
        console.log('No valid school IDs found');
        return [];
    } catch (error) {
        console.error('Error fetching school IDs:', error);
        return [];
    }
}

getExistingSchoolIds();
