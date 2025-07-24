# Events Not Displaying - Quick Fix Guide

If you're having trouble with events not showing up in the School Calendar & Events page, here are some quick solutions:

## 1. Refresh the Data

The simplest solution is to click the "Refresh" button on the Events page. This will fetch the latest data from the server.

## 2. Create a Sample Event

If no events are displayed after refreshing, try creating a new event:

1. Click the "Add New Event" button
2. Fill in all required fields:
   - Title
   - Description
   - Start Date (today or a future date)
   - End Date (must be after start date)
   - Event Type (select any option)
3. Click "Add Event"

## 3. Check the Backend Connection

Make sure the backend server is running:

1. Open a terminal/command prompt
2. Navigate to the backend folder: `cd path\to\MERN-School-Management-System\backend`
3. Start the server: `npm start`

## 4. Use the Debug Mode

If events still don't appear:

1. Click the "Debug Mode" button on the Events page
2. Review the debug information, especially the API Calls Log
3. Check if there are any errors listed in the Errors Log

## 5. Run the Sample Event Scripts

You can use our sample event scripts to add test events:

1. Open a terminal/command prompt
2. Navigate to the docs folder: `cd path\to\MERN-School-Management-System\docs`
3. Run: `node create_sample_events.js`

## 6. Check the MongoDB Database

If all else fails, you may need to check your MongoDB database:

1. Make sure MongoDB is running
2. Connect using MongoDB Compass or the mongo shell
3. Check the 'events' collection in your database
4. Verify events exist with the correct school ID

## Need more help?

For more detailed troubleshooting, see the full [Events Troubleshooting Guide](./events_troubleshooting.md).
