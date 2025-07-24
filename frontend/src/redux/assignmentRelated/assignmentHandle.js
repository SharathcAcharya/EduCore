import axios from 'axios';
import { 
    getAssignmentsStart, getAssignmentsSuccess, getAssignmentsFailed,
    getAssignmentDetailStart, getAssignmentDetailSuccess, getAssignmentDetailFailed,
    createAssignmentStart, createAssignmentSuccess, createAssignmentFailed,
    updateAssignmentStart, updateAssignmentSuccess, updateAssignmentFailed,
    deleteAssignmentStart, deleteAssignmentSuccess, deleteAssignmentFailed,
    submitAssignmentStart, submitAssignmentSuccess, submitAssignmentFailed,
    gradeSubmissionStart, gradeSubmissionSuccess, gradeSubmissionFailed
} from './assignmentSlice';
import { BASE_URL } from '../../config';

export const getAllAssignments = (id) => async (dispatch) => {
    dispatch(getAssignmentsStart());    
    try {
        // Ensure we have a valid school ID
        if (!id) {
            console.error("Missing required school ID");
            dispatch(getAssignmentsFailed('School ID is required'));
            return;
        }
        
        // Extract ID if it's an object
        const schoolId = typeof id === 'object' ? id._id : id;
        console.log("Fetching all assignments for school:", schoolId);
        
        const response = await axios.get(`${BASE_URL}/Assignments/${schoolId}`);
        
        // Handle the case where backend returns a message object instead of an array
        if (response.data && response.data.message && !Array.isArray(response.data)) {
            console.log("No assignments found:", response.data.message);
            dispatch(getAssignmentsSuccess([]));
        } else {
            console.log(`Fetched ${response.data.length} assignments for school ${schoolId}`);
            dispatch(getAssignmentsSuccess(response.data));
        }
    } catch (error) {
        console.error("Error fetching assignments:", error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to get assignments';
        dispatch(getAssignmentsFailed(errorMessage));
    }
}

export const getTeacherAssignments = (teacherId) => async (dispatch) => {
    dispatch(getAssignmentsStart());    try {
        const response = await axios.get(`${BASE_URL}/TeacherAssignments/${teacherId}`);
        dispatch(getAssignmentsSuccess(response.data));
    } catch (error) {
        dispatch(getAssignmentsFailed(error.message || 'Failed to get teacher assignments'));
    }
}

export const getClassAssignments = (schoolId, classId) => async (dispatch) => {
    dispatch(getAssignmentsStart());    
    try {
        console.log(`Fetching class assignments for school: ${schoolId}, class: ${classId}`);
        
        if (!schoolId || !classId) {
            console.error("Missing required parameters:", { schoolId, classId });
            return dispatch(getAssignmentsFailed("Missing school ID or class ID"));
        }
        
        const response = await axios.get(`${BASE_URL}/ClassAssignments/${schoolId}/${classId}`);
        
        // Handle the case where backend returns a message object instead of an array
        if (response.data && response.data.message && !Array.isArray(response.data)) {
            console.log("No assignments found:", response.data.message);
            dispatch(getAssignmentsSuccess([]));
        } else {
            console.log(`Fetched ${response.data.length} class assignments`);
            dispatch(getAssignmentsSuccess(response.data));
        }
    } catch (error) {
        console.error("Error fetching class assignments:", error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to get class assignments';
        dispatch(getAssignmentsFailed(errorMessage));
    }
}

export const getAssignmentDetail = (id) => async (dispatch) => {
    dispatch(getAssignmentDetailStart());    try {
        const response = await axios.get(`${BASE_URL}/Assignment/${id}`);
        dispatch(getAssignmentDetailSuccess(response.data));
    } catch (error) {
        dispatch(getAssignmentDetailFailed(error.message || 'Failed to get assignment details'));
    }
}

export const addAssignment = (fields) => async (dispatch) => {
    dispatch(createAssignmentStart());    
    try {
        console.log("Sending assignment data to server:", fields);
        
        // Validate that all required fields are present
        const requiredFields = ['title', 'description', 'subject', 'sclassName', 'dueDate', 'school', 'assignedBy'];
        const missingFields = requiredFields.filter(field => !fields[field]);
        
        if (missingFields.length > 0) {
            const errorMessage = `Missing required fields: ${missingFields.join(', ')}`;
            console.error(errorMessage);
            dispatch(createAssignmentFailed(errorMessage));
            return { success: false, error: { message: errorMessage } };
        }
        
        const response = await axios.post(`${BASE_URL}/AssignmentCreate`, fields);
        console.log("Server response:", response.data);
        dispatch(createAssignmentSuccess(response.data));
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error creating assignment:", error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create assignment';
        dispatch(createAssignmentFailed(errorMessage));
        return { success: false, error: { message: errorMessage } };
    }
}

export const updateAssignmentDetails = (id, fields) => async (dispatch) => {
    dispatch(updateAssignmentStart());    try {
        const response = await axios.put(`${BASE_URL}/Assignment/${id}`, fields);
        dispatch(updateAssignmentSuccess(response.data));
        return { success: true };
    } catch (error) {
        const errorMessage = error.message || 'Failed to update assignment';
        dispatch(updateAssignmentFailed(errorMessage));
        return { success: false, error: errorMessage };
    }
}

export const deleteAssignment = (id) => async (dispatch) => {
    dispatch(deleteAssignmentStart());    
    try {
        console.log("Deleting assignment:", id);
        await axios.delete(`${BASE_URL}/Assignment/${id}`);
        dispatch(deleteAssignmentSuccess(id));
        return { success: true };
    } catch (error) {
        console.error("Error deleting assignment:", error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete assignment';
        dispatch(deleteAssignmentFailed(errorMessage));
        return { success: false, error: { message: errorMessage } };
    }
}

export const submitAssignment = (id, fields) => async (dispatch) => {
    dispatch(submitAssignmentStart());    try {
        const response = await axios.post(`${BASE_URL}/Assignment/Submit/${id}`, fields);
        dispatch(submitAssignmentSuccess(response.data));
        return { success: true };
    } catch (error) {
        const errorMessage = error.message || 'Failed to submit assignment';
        dispatch(submitAssignmentFailed(errorMessage));
        return { success: false, error: errorMessage };
    }
}

export const gradeSubmission = (id, fields) => async (dispatch) => {
    dispatch(gradeSubmissionStart());    try {
        const response = await axios.post(`${BASE_URL}/Assignment/Grade/${id}`, fields);
        dispatch(gradeSubmissionSuccess(response.data));
        return { success: true };
    } catch (error) {
        const errorMessage = error.message || 'Failed to grade submission';
        dispatch(gradeSubmissionFailed(errorMessage));
        return { success: false, error: errorMessage };
    }
}
