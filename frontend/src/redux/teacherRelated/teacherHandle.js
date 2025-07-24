import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    postDone,
    doneSuccess
} from './teacherSlice';
import { BASE_URL } from '../../config';

export const getAllTeachers = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        // Ensure we have a valid school ID
        if (!id) {
            dispatch(getFailed('School ID is required'));
            return;
        }
        
        // Extract ID if it's an object
        const schoolId = typeof id === 'object' ? id._id : id;
        console.log("Fetching teachers for school ID:", schoolId);
        
        const result = await axios.get(`${BASE_URL}/Teachers/${schoolId}`);
        
        if (result.data.message) {
            console.log("No teachers found:", result.data.message);
            dispatch(getFailed(result.data.message));
        } else {
            console.log(`Found ${result.data.length} teachers for school ${schoolId}`);
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        console.error("Error fetching teachers:", error);
        // Serialize the error before dispatching to Redux
        const serializedError = {
            message: error.response?.data?.message || error.message || 'An error occurred',
            code: error.code || 'UNKNOWN_ERROR',
            status: error.response?.status
        };
        dispatch(getError(serializedError));
    }
}

export const getTeacherDetails = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${BASE_URL}/Teacher/${id}`);
        if (result.data) {
            dispatch(doneSuccess(result.data));
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

export const updateTeachSubject = (teacherId, teachSubject) => async (dispatch) => {
    dispatch(getRequest());

    try {
        await axios.put(`${BASE_URL}/TeacherSubject`, { teacherId, teachSubject }, {
            headers: { 'Content-Type': 'application/json' },
        });
        dispatch(postDone());
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

export const getAllTeachersByClass = (classId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${BASE_URL}/Teachers/class/${classId}`);
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