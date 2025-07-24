/**
 * Redux Utilities 
 * 
 * This file contains utilities for working with Redux in the application.
 * It includes common patterns for actions, reducers, and middleware.
 */

import { serializeError } from './errorUtils';

/**
 * Creates a standard async thunk pattern for Redux
 * This simplifies the creation of API call handlers with consistent error handling
 * 
 * @param {Function} apiCall - Async function that makes the API call
 * @param {Object} actions - Object containing the Redux actions to dispatch
 * @param {Function} actions.request - Action to dispatch when request starts
 * @param {Function} actions.success - Action to dispatch on success
 * @param {Function} actions.failure - Action to dispatch on failure
 * @param {Function} actions.error - Action to dispatch on error
 * @returns {Function} - Redux thunk function
 */
export const createApiThunk = (apiCall, actions) => {
  return (...args) => async (dispatch) => {
    try {
      // Dispatch request action
      if (actions.request) {
        dispatch(actions.request());
      }
      
      // Make API call
      const result = await apiCall(...args);
      
      // Handle API response
      if (result.data?.message && actions.failure) {
        // API returned an error message
        dispatch(actions.failure(result.data.message));
        return null;
      } else if (actions.success) {
        // API returned success data
        dispatch(actions.success(result.data));
        return result.data;
      }
    } catch (error) {
      // Handle and serialize error
      if (actions.error) {
        const serializedError = serializeError(error);
        dispatch(actions.error(serializedError));
      }
      return null;
    }
  };
};

/**
 * Creates a standard error handler for Redux API calls
 * 
 * @param {Error} error - The error that occurred
 * @param {Function} dispatch - Redux dispatch function
 * @param {Function} errorAction - Redux action creator for error
 */
export const handleApiError = (error, dispatch, errorAction) => {
  const serializedError = serializeError(error);
  dispatch(errorAction(serializedError));
};
