import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    stuffDone
} from './studentSlice';
import { BASE_URL } from '../../config';

export const getAllStudents = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        // Ensure we have a valid school ID
        if (!id) {
            dispatch(getFailed('School ID is required'));
            return;
        }
        
        // Extract ID if it's an object
        const schoolId = typeof id === 'object' ? id._id : id;
        console.log("Fetching students for school ID:", schoolId);
        
        const result = await axios.get(`${BASE_URL}/Students/${schoolId}`);
        
        if (result.data.message) {
            console.log("No students found:", result.data.message);
            dispatch(getFailed(result.data.message));
        } else {
            console.log(`Found ${result.data.length} students for school ${schoolId}`);
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        console.error("Error fetching students:", error);
        const serializedError = {
            message: error.message || 'An error occurred',
            code: error.code || 'UNKNOWN_ERROR',
            status: error.response?.status
        };
        dispatch(getError(serializedError));
    }
}

export const updateStudentFields = (id, fields, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(stuffDone());
        }
    } catch (error) {
        const serializedError = {
            message: error.message || 'An error occurred',
            code: error.code || 'UNKNOWN_ERROR',
            status: error.response?.status
        };
        dispatch(getError(serializedError));
    }
}

export const removeStuff = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(stuffDone());
        }
    } catch (error) {
        const serializedError = {
            message: error.message || 'An error occurred',
            code: error.code || 'UNKNOWN_ERROR',
            status: error.response?.status
        };
        dispatch(getError(serializedError));
    }
}

export const allStudentsByClass = (classId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${BASE_URL}/StudentsByClass/${classId}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        const serializedError = {
            message: error.message || 'An error occurred',
            code: error.code || 'UNKNOWN_ERROR',
            status: error.response?.status
        };
        dispatch(getError(serializedError));
    }
}