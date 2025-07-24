# Real-Time Messaging System Troubleshooting Guide

This guide helps diagnose and fix issues with the real-time messaging functionality in the School Management System.

## Common Issues and Solutions

### 1. "Disconnected" Status Indicator

If you see the disconnected status icon (❌) in the messaging interface:

**Possible causes:**

- Backend server is not running
- WebSocket connection failed
- Socket.IO configuration issues

**Solutions:**

1. Verify the backend server is running
2. Check browser console for connection errors
3. Ensure BASE_URL in frontend/src/config.js is correctly set
4. Try reloading the page to reinitiate the connection

### 2. Users Not Displaying in Chat List

**Possible causes:**

- Data fetching failed
- Redux state not properly populated
- Permission issues

**Solutions:**

1. Check browser console for API errors
2. Verify the user has proper permissions
3. Confirm user data exists in the database
4. For teachers: ensure they have a class assigned
5. For students: ensure they belong to a class

### 3. Messages Not Sending or Receiving in Real-Time

**Possible causes:**

- WebSocket connection issues
- Message data format problems
- Room joining failures

**Solutions:**

1. Check the socket connection status
2. Verify the chatRoomId is properly set in messages
3. Ensure both sender and receiver are in the same chat room
4. Check server logs for any errors in message handling

## Diagnostic Tools

### WebSocket Connection Test

Run the following script in your browser console to test the WebSocket connection:

```javascript
// Import from docs/socket_connection_test.js
const socketUrl = new URL(window.location.origin);
const backendUrl = socketUrl.protocol + "//" + socketUrl.hostname + ":5000";
const socket = io(backendUrl, { transports: ["websocket", "polling"] });

socket.on("connect", () => console.log("Connected:", socket.id));
socket.on("connect_error", (error) =>
  console.error("Connection error:", error)
);
```

### User Data Verification

Check if user data is properly loaded:

```javascript
// For Admin view
console.log("Teachers:", store.getState().teacher.teachers);
console.log("Students:", store.getState().student.students);

// For Teacher view
console.log("Students:", store.getState().student.students);
console.log("Admins:", store.getState().admin.admins);

// For Student view
console.log("Teachers:", store.getState().teacher.teachers);
console.log("Admins:", store.getState().admin.admins);
```

### Message Flow Verification

To test the complete message flow:

1. Open two different browsers or incognito windows
2. Log in as two different users (e.g., teacher and student)
3. Send messages between them and verify real-time delivery
4. Check that both conversation histories load properly

## Server-Side Debugging

If issues persist, check the server logs for these common errors:

1. Socket connection errors
2. Room joining failures
3. Message broadcasting issues
4. Database query failures

## Contact Support

If you cannot resolve the issue using this guide, please contact the system administrator with:

1. User role (admin, teacher, or student)
2. Browser and device information
3. Steps to reproduce the issue
4. Any error messages from the console
