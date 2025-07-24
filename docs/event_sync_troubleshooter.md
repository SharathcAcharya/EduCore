# Events Synchronization Troubleshooting Guide

This guide helps diagnose and fix issues with event creation and database synchronization in the School Management System.

## Common Issues

### 1. Events not showing up after creation

If you click "Add Event" and fill out the form, but after submission, the event doesn't appear in the list, try these fixes:

#### Potential Causes:

- Network issues between frontend and backend
- Invalid data being submitted
- Redux state not updating properly
- Backend validation errors

#### Solutions:

1. **Check Browser Console**

   - Open browser developer tools (F12) and check the console for errors
   - Look for network requests to `/api/EventCreate` and check their status

2. **Verify Server Logs**

   - Check the backend terminal for error messages
   - Look for validation errors or database connection issues

3. **Force Refresh**

   - Click the "Refresh" button in the Events page
   - Try logging out and logging back in

4. **Data Format Issues**
   - Ensure dates are properly formatted (YYYY-MM-DD)
   - Verify that all required fields have values

### 2. Quick Fixes

Try these steps if events aren't being saved:

1. **Backend Restart**

   ```
   cd backend
   npm start
   ```

2. **Frontend Restart**

   ```
   cd frontend
   npm start
   ```

3. **Clear Browser Cache**
   - Clear browser cache and cookies
   - Try in incognito/private browsing mode

### 3. Testing Event Creation with API

You can test event creation directly with the API:

```javascript
// Run this in browser console
async function testCreateEvent() {
  const eventData = {
    title: "Test Event " + new Date().toISOString(),
    description: "This is a test event",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000).toISOString(),
    eventType: "Meeting",
    school: "YOUR_SCHOOL_ID", // Replace with actual school ID
    createdBy: "Test Script",
  };

  console.log("Creating test event:", eventData);

  try {
    const response = await fetch("http://localhost:5000/api/EventCreate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });

    const result = await response.json();
    console.log("Event creation result:", result);
    return result;
  } catch (error) {
    console.error("Error creating event:", error);
    return null;
  }
}

// Execute the function
testCreateEvent().then((result) => {
  if (result && result._id) {
    console.log("Success! Event created with ID:", result._id);
  } else {
    console.log("Failed to create event");
  }
});
```

### 4. Checking Database Connection

Make sure MongoDB is running and accessible:

```javascript
// Run this in your backend terminal
const mongoose = require("mongoose");
mongoose
  .connect("mongodb://localhost:27017/schooldb")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));
```

## Manual Event Creation

If the UI isn't working, you can manually add events to the database:

1. Start MongoDB shell
2. Connect to your database
3. Insert a document into the events collection:

```javascript
db.events.insertOne({
  title: "Manual Test Event",
  description: "This is a manually created event",
  startDate: new Date(),
  endDate: new Date(Date.now() + 86400000),
  eventType: "Meeting",
  school: ObjectId("YOUR_SCHOOL_ID"), // Replace with actual school ID
  createdBy: "Manual Entry",
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

## Technical Debugging Checklist

- [x] Verify Redux actions are being dispatched
- [x] Check API endpoints are correctly implemented
- [x] Ensure MongoDB connection is stable
- [x] Validate form data before submission
- [x] Check date format handling
- [x] Verify class reference handling
- [x] Test with direct API calls
- [x] Check Redux store updates

If you've tried all these steps and still have issues, please contact the development team for further assistance.
