import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    getStudentsSuccess,
    detailsSuccess,
    getFailedTwo,
    getSubjectsSuccess,
    getSubDetailsSuccess,
    getSubDetailsRequest
} from './sclassSlice';
import { BASE_URL } from '../../config';

export const getAllSclasses = (id, address) => async (dispatch) => {
    dispatch(getRequest());
    
    try {
        // Ensure we have a valid school ID
        if (!id) {
            console.error("Missing required school ID");
            dispatch(getFailedTwo('School ID is required'));
            return [];
        }
        
        // Extract ID if it's an object
        const schoolId = typeof id === 'object' ? id._id : id;
        console.log(`Fetching classes for school ID: ${schoolId}, Address: ${address}`);
        
        // Handle undefined or empty address
        if (!address) {
            address = 'Sclass'; // Default to Sclass if address is undefined
            console.log(`Address was undefined, defaulting to: ${address}`);
        }
        
        // Determine the correct endpoint
        let endpoint;
        if (address === 'Sclass') {
            endpoint = `${BASE_URL}/SclassList/${schoolId}`;
            console.log(`Using direct school classes endpoint: ${endpoint}`);
        } else {
            endpoint = `${BASE_URL}/${address}List/${schoolId}`;
            console.log(`Using standard endpoint: ${endpoint}`);
        }
        
        const result = await axios.get(endpoint);
        console.log(`Classes API response:`, result.data);
        
        if (result.data.message) {
            console.error(`Error fetching classes: ${result.data.message}`);
            dispatch(getFailedTwo(result.data.message));
            return [];
        } else {
            console.log(`Successfully loaded ${result.data.length} classes for school ${schoolId}`);
            dispatch(getSuccess(result.data));
            return result.data;
        }
    } catch (error) {
        console.error(`Error in getAllSclasses:`, error);
        const serializedError = {
            message: error.message || 'An error occurred',
            code: error.code || 'UNKNOWN_ERROR',
            status: error.response?.status
        };
        dispatch(getError(serializedError));
        return [];
    }
}

export const getClassStudents = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${BASE_URL}/Sclass/Students/${id}`);
        if (result.data.message) {
            dispatch(getFailedTwo(result.data.message));
        } else {
            dispatch(getStudentsSuccess(result.data));
        }    } catch (error) {
        const serializedError = {
            message: error.message || 'An error occurred',
            code: error.code || 'UNKNOWN_ERROR',
            status: error.response?.status
        };
        dispatch(getError(serializedError));
    }
}

export const getClassDetails = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${BASE_URL}/${address}/${id}`);
        if (result.data) {
            dispatch(detailsSuccess(result.data));
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

export const getSubjectList = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${BASE_URL}/${address}/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSubjectsSuccess(result.data));
        }    } catch (error) {
        const serializedError = {
            message: error.message || 'An error occurred',
            code: error.code || 'UNKNOWN_ERROR',
            status: error.response?.status
        };
        dispatch(getError(serializedError));
    }
}

export const getTeacherFreeClassSubjects = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${BASE_URL}/FreeSubjectList/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSubjectsSuccess(result.data));
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

export const getSubjectDetails = (id, address) => async (dispatch) => {
    dispatch(getSubDetailsRequest());

    try {
        console.log(`Fetching subject details: ID=${id}, Address=${address}`);
        if (!id) {
            console.error("Missing subject ID in getSubjectDetails");
            dispatch(getError({ message: "Missing subject ID" }));
            return;
        }
        
        const result = await axios.get(`${BASE_URL}/${address}/${id}`);
        console.log(`Subject details API response:`, result.data);
        
        if (result.data) {
            // Check for required fields
            if (!result.data.school) {
                console.error("Subject details missing school ID");
            }
            if (!result.data.sclassName) {
                console.error("Subject details missing class information");
            }
            
            dispatch(getSubDetailsSuccess(result.data));
        } else {
            console.error("Empty subject details response");
            dispatch(getError({ message: "Failed to load subject details" }));
        }
    } catch (error) {
        console.error(`Error in getSubjectDetails:`, error);
        const serializedError = {
            message: error.response?.data?.message || error.message || 'An error occurred',
            code: error.code || 'UNKNOWN_ERROR',
            status: error.response?.status
        };
        dispatch(getError(serializedError));
    }
}