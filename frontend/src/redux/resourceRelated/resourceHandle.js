import axios from 'axios';
import { 
    getResourcesStart, getResourcesSuccess, getResourcesFailed,
    createResourceStart, createResourceSuccess, createResourceFailed,
    updateResourceStart, updateResourceSuccess, updateResourceFailed,
    deleteResourceStart, deleteResourceSuccess, deleteResourceFailed
} from './resourceSlice';
import { BASE_URL } from '../../config';
import { extractId } from '../../utils/idExtractor';

export const getAllResources = (id) => async (dispatch) => {
    dispatch(getResourcesStart());
    try {
        const idValue = extractId(id);
        if (!idValue) {
            throw new Error('Resource ID is required');
        }
        console.log("Fetching resources for school ID:", idValue);
        const response = await axios.get(`${BASE_URL}/Resources/${idValue}`);
        console.log("Fetched resources:", response.data);
        dispatch(getResourcesSuccess(response.data));
    } catch (error) {
        console.error("Error fetching resources:", error);
        dispatch(getResourcesFailed({
            message: error.response?.data?.message || error.message || 'Failed to fetch resources'
        }));
    }
}

export const getClassResources = (schoolId, classId) => async (dispatch) => {
    dispatch(getResourcesStart());    
    try {
        const schoolIdValue = extractId(schoolId);
        const classIdValue = extractId(classId);
        
        if (!schoolIdValue || !classIdValue) {
            throw new Error('School ID and Class ID are required');
        }
        
        console.log("Fetching class resources for school:", schoolIdValue, "class:", classIdValue);
        const response = await axios.get(`${BASE_URL}/Resources/Class/${schoolIdValue}/${classIdValue}`);
        console.log("Fetched class resources:", response.data);
        dispatch(getResourcesSuccess(response.data));
    } catch (error) {
        console.error("Error fetching class resources:", error);
        dispatch(getResourcesFailed({
            message: error.response?.data?.message || error.message || 'Failed to fetch class resources'
        }));
    }
}

export const getSubjectResources = (schoolId, subjectId) => async (dispatch) => {
    dispatch(getResourcesStart());    
    try {
        const schoolIdValue = extractId(schoolId);
        const subjectIdValue = extractId(subjectId);
        
        if (!schoolIdValue || !subjectIdValue) {
            throw new Error('School ID and Subject ID are required');
        }
        
        console.log("Fetching subject resources for school:", schoolIdValue, "subject:", subjectIdValue);
        const response = await axios.get(`${BASE_URL}/Resources/Subject/${schoolIdValue}/${subjectIdValue}`);
        console.log("Fetched subject resources:", response.data);
        dispatch(getResourcesSuccess(response.data));
    } catch (error) {
        console.error("Error fetching subject resources:", error);
        dispatch(getResourcesFailed({
            message: error.response?.data?.message || error.message || 'Failed to fetch subject resources'
        }));
    }
}

export const addResource = (fields) => async (dispatch) => {
    dispatch(createResourceStart());
    try {
        // Ensure data is properly formatted
        const resourceData = { ...fields };
        
        // Process school field
        resourceData.school = extractId(resourceData.school);
        if (!resourceData.school) {
            throw new Error('School ID is required');
        }
        
        // Process class name if present
        if (resourceData.sclassName) {
            resourceData.sclassName = extractId(resourceData.sclassName);
        }
        
        // Convert empty sclassName to null or remove it
        if (!resourceData.sclassName || resourceData.sclassName === '') {
            delete resourceData.sclassName;
        }
        
        // Process subject if present
        if (resourceData.subject) {
            resourceData.subject = extractId(resourceData.subject);
        }
        
        // Convert empty subject to null or remove it
        if (!resourceData.subject || resourceData.subject === '') {
            delete resourceData.subject;
        }
          // Process uploader ID
        resourceData.uploadedBy = extractId(resourceData.uploadedBy);
        if (!resourceData.uploadedBy) {
            throw new Error('Uploader ID is required');        }
        
        console.log("Adding resource with fields:", resourceData);
        const response = await axios.post(`${BASE_URL}/ResourceCreate`, resourceData);
        console.log("Resource creation response:", response.data);
        dispatch(createResourceSuccess(response.data));
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error creating resource:", error);
        const errorMessage = {
            message: error.response?.data?.message || error.message || 'Failed to create resource'
        };
        dispatch(createResourceFailed(errorMessage));
        return { success: false, error: errorMessage };
    }
}

export const updateResourceDetails = (id, fields) => async (dispatch) => {
    dispatch(updateResourceStart());    
    try {
        // Validate resource ID
        if (!id) {
            throw new Error('Resource ID is required');
        }
        
        // Prepare updated fields
        const updatedFields = { ...fields };
        
        // Process school field if present
        if (updatedFields.school) {
            updatedFields.school = extractId(updatedFields.school);
        }
        
        // Process class name if present
        if (updatedFields.sclassName) {
            updatedFields.sclassName = extractId(updatedFields.sclassName);
        }
        
        // Process subject if present
        if (updatedFields.subject) {
            updatedFields.subject = extractId(updatedFields.subject);
        }        console.log("Updating resource with ID:", id);
        console.log("Updated fields:", updatedFields);
        const response = await axios.put(`${BASE_URL}/Resource/${id}`, updatedFields);
        console.log("Resource update response:", response.data);
        dispatch(updateResourceSuccess(response.data));
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error updating resource:", error);
        const errorMessage = {
            message: error.response?.data?.message || error.message || 'Failed to update resource'
        };
        dispatch(updateResourceFailed(errorMessage));
        return { success: false, error: errorMessage };
    }
}

export const deleteResource = (id) => async (dispatch) => {
    dispatch(deleteResourceStart());
    try {
        const resourceId = extractId(id);
        if (!resourceId) {
            throw new Error('Resource ID is required');        }
          console.log("Deleting resource with ID:", resourceId);
        await axios.delete(`${BASE_URL}/Resource/${resourceId}`);
        
        console.log("Resource deleted successfully");
        dispatch(deleteResourceSuccess(resourceId));
        return { success: true };
    } catch (error) {
        console.error("Error deleting resource:", error);
        const errorMessage = {
            message: error.response?.data?.message || error.message || 'Failed to delete resource'
        };
        dispatch(deleteResourceFailed(errorMessage));
        return { success: false, error: errorMessage };
    }
}
