# Redux Best Practices Guide

## Error Handling and Serialization

Redux requires all state to be serializable. This means we can't store Error objects, Promises, Functions, or other non-serializable data in our Redux store.

### Common Serialization Issues

1. **Error Objects**: When handling API errors, never store the raw Error or AxiosError object in Redux state.
2. **School IDs**: Always ensure school IDs are passed as strings, not as objects.
3. **Promises**: Never store promises in Redux state.

### Proper Error Handling Pattern

```javascript
try {
  // API code here
} catch (error) {
  // Serialize the error before dispatching to Redux
  const serializedError = {
    message: error.message || "An error occurred",
    code: error.code || "UNKNOWN_ERROR",
    status: error.response?.status,
  };
  dispatch(getError(serializedError));
}
```

### Using the Error Utility Functions

We have created utility functions to help with error serialization:

```javascript
import { serializeError, getSchoolId } from "../../utils/errorUtils";

// Example usage:
try {
  // API code
} catch (error) {
  dispatch(getError(serializeError(error)));
}

// Get school ID safely
const schoolId = getSchoolId(currentUser);
dispatch(getAllAdmins(schoolId));
```

### Redux Store Configuration

Our Redux store is configured to ignore certain actions and paths to prevent serialization warnings:

```javascript
middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [
                'user/authError',
                'user/getError',
                // more ignored actions...
            ],
            ignoredActionPaths: ['error', 'payload.error', 'meta.arg'],
            ignoredPaths: [
                'user.error',
                'teacher.error',
                // more ignored paths...
            ]
        },
    }),
```

## School ID Handling

When working with school IDs, always ensure you're passing a string ID, not an object:

```javascript
// WRONG - might pass an object instead of string ID
dispatch(getAllAdmins(currentUser.school));

// RIGHT - ensure we're using a string ID
const schoolId =
  typeof currentUser.school === "object"
    ? currentUser.school._id
    : currentUser.school;

dispatch(getAllAdmins(schoolId));

// BEST - use the utility function
import { getSchoolId } from "../../utils/errorUtils";
const schoolId = getSchoolId(currentUser);
dispatch(getAllAdmins(schoolId));
```

## Testing Your Changes

Run the Redux serialization test script to verify your implementation:

```bash
node redux-serialization-test.js
```

If all tests pass, your implementation should be serializable and work correctly with Redux.
