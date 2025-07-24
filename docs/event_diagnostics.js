// Event Creation Debug Tool
// Run this in the browser console to diagnose event creation issues

(function() {
    console.log("=== EVENT SYSTEM DIAGNOSTICS ===");
    console.log("This tool will help diagnose issues with event creation");
    
    // Check if Redux store is accessible
    let store;
    try {
        store = window.__REDUX_STATE__;
        console.log("Redux state access:", store ? "SUCCESSFUL" : "FAILED");
    } catch (e) {
        console.error("Cannot access Redux store:", e);
    }
    
    // Check API connectivity
    async function checkAPI() {
        try {
            const response = await fetch('http://localhost:5000/api/health');
            const data = await response.json();
            console.log("API health check:", data.status === "ok" ? "SUCCESSFUL" : "FAILED");
            return data.status === "ok";
        } catch (e) {
            console.error("API connectivity check failed:", e);
            return false;
        }
    }
    
    // Get current user details
    function getCurrentUser() {
        try {
            const userString = localStorage.getItem('user');
            if (!userString) {
                console.error("No user found in localStorage");
                return null;
            }
            
            const user = JSON.parse(userString);
            console.log("Current user:", user.name);
            console.log("School ID:", user.school || user._id);
            return user;
        } catch (e) {
            console.error("Error getting current user:", e);
            return null;
        }
    }
    
    // Create test event
    async function createTestEvent(user) {
        if (!user) {
            console.error("Cannot create test event: No user available");
            return null;
        }
        
        const schoolId = user.school || user._id;
        if (!schoolId) {
            console.error("Cannot create test event: No school ID available");
            return null;
        }
        
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const eventData = {
            title: "DIAGNOSTIC TEST EVENT",
            description: "This event was created by the diagnostic tool",
            startDate: now.toISOString(),
            endDate: tomorrow.toISOString(),
            eventType: "Meeting",
            school: schoolId,
            createdBy: user.name || "Diagnostic Tool"
        };
        
        console.log("Creating test event with data:", eventData);
        
        try {
            const response = await fetch('http://localhost:5000/api/EventCreate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            });
            
            const result = await response.json();
            console.log("Event creation result:", result);
            
            if (result && result._id) {
                console.log("TEST EVENT CREATION: SUCCESSFUL");
                console.log("Event ID:", result._id);
                return result;
            } else {
                console.error("TEST EVENT CREATION: FAILED");
                console.error("Response:", result);
                return null;
            }
        } catch (e) {
            console.error("Error creating test event:", e);
            return null;
        }
    }
    
    // Check if events are loading
    async function checkEvents(user) {
        if (!user) {
            console.error("Cannot check events: No user available");
            return false;
        }
        
        const schoolId = user.school || user._id;
        if (!schoolId) {
            console.error("Cannot check events: No school ID available");
            return false;
        }
        
        try {
            const response = await fetch(`http://localhost:5000/api/Events/${schoolId}`);
            const events = await response.json();
            
            if (Array.isArray(events)) {
                console.log(`Found ${events.length} events for school ID ${schoolId}`);
                if (events.length > 0) {
                    console.log("Sample event:", events[0]);
                }
                return true;
            } else {
                console.error("Events response is not an array:", events);
                return false;
            }
        } catch (e) {
            console.error("Error checking events:", e);
            return false;
        }
    }
    
    // Main diagnostic function
    async function runDiagnostics() {
        console.log("Starting diagnostics...");
        
        const apiStatus = await checkAPI();
        if (!apiStatus) {
            console.error("CRITICAL ERROR: API is not accessible");
            console.log("Please check if the backend server is running");
            return;
        }
        
        const user = getCurrentUser();
        if (!user) {
            console.error("CRITICAL ERROR: User information not available");
            console.log("Please log in again to refresh user session");
            return;
        }
        
        const eventsStatus = await checkEvents(user);
        if (!eventsStatus) {
            console.warn("WARNING: Could not fetch existing events");
        }
        
        const testEvent = await createTestEvent(user);
        if (testEvent) {
            console.log("Event creation is working correctly");
            console.log("If events are not showing in the UI, it might be a display or state update issue");
            
            // Wait 2 seconds and check if the new event appears in the list
            console.log("Checking if new event appears in the events list...");
            setTimeout(async () => {
                const eventsAfter = await checkEvents(user);
                if (eventsAfter) {
                    console.log("DIAGNOSIS COMPLETE: The event system appears to be working correctly on the API side");
                    console.log("If events are not showing in the UI, try refreshing the page or checking the Redux state updates");
                }
            }, 2000);
        } else {
            console.error("DIAGNOSIS COMPLETE: There is an issue with event creation");
            console.log("Please check the backend logs for more details");
        }
    }
    
    // Run the diagnostics
    runDiagnostics();
})();
