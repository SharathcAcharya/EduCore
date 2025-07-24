# Events System Documentation

## Overview
The School Management System includes a comprehensive events management module that allows administrators to create, view, edit, and delete school events. Events can be assigned to specific classes or made school-wide, and they can be categorized by type (Holiday, Exam, Meeting, Activity, or Other).

## Key Features
- Create, edit, and delete school events
- Filter events by type (Holiday, Exam, Meeting, Activity, Other)
- Search for specific events
- Sort events by various criteria
- Assign events to specific classes or make them school-wide
- Color-coded event types for better visualization
- Modern dashboard view for easier event management

## Components

### 1. Events List View (`AdminEventsFixed.js`)
The main events page that displays all events in a tabular format with filtering, sorting, and searching capabilities.

### 2. Events Dashboard (`EventsDashboard.js`)
A modern, card-based view of events that provides a more visual representation of the school calendar.

### 3. Event Form Component (`EventForm.js`)
A reusable form component for creating and editing events.

### 4. Form Dialog Component (`FormDialog.js`)
A dialog component used to display the event form.

### 5. Event Utilities (`eventUtils.js`)
Utility functions for handling event data, including date formatting and ObjectID validation.

### 6. Event Form Hook (`useEventForm.js`)
A custom React hook that manages the event form state and submission logic.

## Data Flow

1. The event data is managed through Redux with actions defined in `eventHandle.js`.
2. When creating or editing an event, the form data is validated and processed by the `useEventForm` hook.
3. The processed data is then sent to the server via Redux actions.
4. The server stores the event in the MongoDB database through the event controller.
5. After successful creation or update, the events list is refreshed to show the latest data.

## API Endpoints

- `POST /api/EventCreate` - Create a new event
- `GET /api/Events/:id` - Get all events for a school
- `GET /api/Events/:schoolId/:classId` - Get events for a specific class
- `PUT /api/Event/:id` - Update an existing event
- `DELETE /api/Event/:id` - Delete an event

## Event Object Structure

```javascript
{
  _id: String,                // MongoDB ObjectID
  title: String,              // Event title
  description: String,        // Event description
  startDate: Date,            // Event start date
  endDate: Date,              // Event end date
  eventType: String,          // 'Holiday', 'Exam', 'Meeting', 'Activity', 'Other'
  school: String,             // School ID (MongoDB ObjectID)
  sclassName: String|null,    // Class ID or null for school-wide events
  createdBy: String,          // Name of the user who created the event
  createdAt: Date,            // Creation timestamp
  updatedAt: Date             // Last update timestamp
}
```

## Usage Instructions

### Accessing the Events System
1. Log in as an administrator
2. Navigate to "Events Calendar" in the sidebar menu
3. The main events list view will be displayed
4. Click "Open Dashboard View" to switch to the card-based dashboard view

### Creating a New Event
1. Click the "Add Event" button
2. Fill in the event details in the form:
   - Title (required)
   - Description (required)
   - Start Date (required)
   - End Date (required)
   - Event Type (required, default: Meeting)
   - Class (optional, default: All Classes)
3. Click "Add Event" to save the event

### Editing an Event
1. Find the event you want to edit in the list or dashboard
2. Click the "Edit" button for that event
3. Modify the event details in the form
4. Click "Update Event" to save the changes

### Deleting an Event
1. Find the event you want to delete in the list or dashboard
2. Click the "Delete" button for that event
3. Confirm the deletion in the confirmation dialog

## Troubleshooting

### Common Issues

#### 1. Events not showing up after creation
- Make sure the school ID is valid
- Check that the events are being fetched for the correct school
- Refresh the events list using the "Refresh" button

#### 2. Invalid school ID error
- Ensure that the current user has a valid school ID
- If you're an admin, your user ID is typically used as the school ID
- Check that the school ID is a valid MongoDB ObjectID (24 character hex string)

#### 3. Date validation errors
- Make sure the end date is not before the start date
- Use the date picker to select valid dates

## Development Notes

### Adding New Event Types
To add a new event type:
1. Update the `EventForm.js` component to include the new type in the dropdown
2. Add a color for the new type in the `getEventTypeColor` function in `EventsDashboard.js`
3. Update any filtering or sorting functions to handle the new type

### Extending Event Properties
To add new properties to events:
1. Update the event schema in `eventSchema.js`
2. Modify the `EventForm.js` component to include fields for the new properties
3. Update the `useEventForm.js` hook to handle the new properties
4. Update the display components to show the new properties

## Testing
To test the events system:
1. Use the `node_event_tester.js` script to verify event creation
2. Use the `create_simple_event.js` script to create test events with the default school ID
3. Verify that events appear correctly in both the list and dashboard views
