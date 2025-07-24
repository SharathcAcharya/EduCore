# API Endpoint Fixes

## Summary of API Endpoint Fixes

This document outlines the additional fixes made to resolve API endpoint issues in the MERN School Management System.

## Issues Fixed

1. **"undefinedList" in URL**: Fixed requests to `http://localhost:5000/undefinedList/...` by handling undefined address parameters
2. **Teacher Class Endpoint**: Added missing endpoint for `http://localhost:5000/Teachers/class/:id`
3. **Student Class Endpoint**: Added missing endpoint for `http://localhost:5000/StudentsByClass/:id`
4. **Message Endpoint**: Fixed the message details endpoint to properly handle query parameters instead of request body
5. **Base URL Consistency**: Ensured consistent usage of BASE_URL from config.js across all handler files

## Files Modified

### Backend Routes

- `backend/routes/route.js`: Added missing endpoints for Teachers/class and StudentsByClass

### Backend Controllers

- `backend/controllers/message-controller.js`: Modified to accept data from both query params and request body

### Frontend API Handlers

- `frontend/src/redux/sclassRelated/sclassHandle.js`:
  - Added check for undefined address parameter
  - Replaced direct process.env usage with BASE_URL import
- `frontend/src/redux/studentRelated/studentHandle.js`: Updated to use BASE_URL
- `frontend/src/redux/messageRelated/messageHandle.js`: Updated to use query parameters instead of request body

## Key Implementations

### Default Address Parameter

```javascript
// Handle undefined or empty address
if (!address) {
  address = "Sclass"; // Default to Sclass if address is undefined
  console.log(`Address was undefined, defaulting to: ${address}`);
}
```

### Query Parameters Instead of Request Body

```javascript
// Frontend
const response = await axios.get(`${BASE_URL}/Message/${receiverId}`, {
  params: { currentUserId: senderId, currentUserModel: senderModel },
});

// Backend
const currentUserId = req.body.currentUserId || req.query.currentUserId;
const currentUserModel =
  req.body.currentUserModel || req.query.currentUserModel;
```

### Consistent BASE_URL Usage

```javascript
import { BASE_URL } from "../../config";

// Use BASE_URL consistently instead of process.env.REACT_APP_BASE_URL
const result = await axios.get(`${BASE_URL}/endpoint/${id}`);
```

## Enhanced Message Endpoint Fixes

We've made further improvements to the message endpoint to resolve the remaining issues:

1. **Enhanced Query Parameter Handling**: Updated the backend to better handle query parameters for message details
2. **Improved ID Handling**: Added support for proper ObjectId handling in the message controller
3. **Debugging Support**: Added detailed logging in the message controller to diagnose issues
4. **Error Handling**: Added try-catch blocks around message operations to prevent failures

### Enhanced Query Parameter Code

```javascript
// Frontend - MessageHandle.js
export const getMessageDetail =
  (receiverId, senderId, senderModel) => async (dispatch) => {
    dispatch(getMessageDetailStart());
    try {
      console.log(
        `Getting message details: receiverId=${receiverId}, senderId=${senderId}, senderModel=${senderModel}`
      );

      const response = await axios.get(`${BASE_URL}/Message/${receiverId}`, {
        params: {
          currentUserId: senderId,
          currentUserModel: senderModel,
          senderModel: senderModel, // Include both for backward compatibility
        },
      });
      dispatch(getMessageDetailSuccess(response.data));
      return response.data;
    } catch (error) {
      // Error handling
    }
  };

// Backend - Message Controller
const getMessageDetail = async (req, res) => {
  try {
    const { id } = req.params;
    // Access data from both body and query parameters
    const currentUserId = req.body.currentUserId || req.query.currentUserId;
    const currentUserModel =
      req.body.currentUserModel ||
      req.query.currentUserModel ||
      req.query.senderModel;

    console.log("Message Detail Request:", {
      id,
      currentUserId,
      currentUserModel,
      query: req.query,
      body: req.body,
    });

    // Rest of the function
  } catch (error) {
    // Error handling
  }
};
```
