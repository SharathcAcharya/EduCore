import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    adminDone
} from './adminSlice';
import { BASE_URL } from '../../config';

export const getAllAdmins = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        // Check if id is a valid value before making the API call
        if (!id || typeof id !== 'string') {
            dispatch(getFailed(`Invalid school ID: ${id}`));
            return;
        }
        
        const result = await axios.get(`${BASE_URL}/Admins/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        // Serialize the error before dispatching to Redux
        const serializedError = {
            message: error.message || 'An error occurred',
            code: error.code || 'UNKNOWN_ERROR',
            status: error.response?.status
        };
        dispatch(getError(serializedError));
    }
}

export const getAdminDetails = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${BASE_URL}/Admin/${id}`);
        if (result.data) {
            dispatch(adminDone(result.data));
        }
    } catch (error) {
        // Serialize the error before dispatching to Redux
        const serializedError = {
            message: error.message || 'An error occurred',
            code: error.code || 'UNKNOWN_ERROR',
            status: error.response?.status
        };
        dispatch(getError(serializedError));
    }
}
