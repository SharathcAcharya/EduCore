import axios from 'axios';
import { 
    getEventsStart, getEventsSuccess, getEventsFailed,
    createEventStart, createEventSuccess, createEventFailed,
    updateEventStart, updateEventSuccess, updateEventFailed,
    deleteEventStart, deleteEventSuccess, deleteEventFailed
} from './eventSlice';
import { BASE_URL } from '../../config';
import { isValidObjectId } from '../../utils/eventUtils';
import { extractId } from '../../utils/idExtractor';

export const getAllEvents = (id) => async (dispatch) => {
    dispatch(getEventsStart());
    try {
        // Ensure we have a valid school ID
        if (!id) {
            console.error("Missing required school ID");
            dispatch(getEventsFailed('School ID is required'));
            return { success: false, error: 'School ID is required' };
        }
        
        // Extract ID from school object if it's an object
        const idValue = typeof id === 'object' ? id._id : id;
        console.log("Fetching events for school ID:", idValue);
        
        const response = await axios.get(`${BASE_URL}/Events/${idValue}`);
        console.log("Fetched events:", response.data);
        
        if (Array.isArray(response.data)) {
            console.log(`Found ${response.data.length} events for school ${idValue}`);
            dispatch(getEventsSuccess(response.data));
            return { success: true, data: response.data };
        } else {
            console.log("No events found or invalid response format");
            dispatch(getEventsSuccess([]));
            return { success: true, data: [] };
        }
    } catch (error) {
        console.error("Error fetching events:", error);
        dispatch(getEventsFailed(error.response?.data || "Failed to load events"));
        return { success: false, error: error.response?.data || "Failed to load events" };
    }
}

export const getClassEvents = (schoolId, classId) => async (dispatch) => {
    dispatch(getEventsStart());
    try {
        // Extract ID from school object if it's an object
        const schoolIdValue = extractId(schoolId);
        const classIdValue = extractId(classId);
        
        if (!schoolIdValue) {
            throw new Error('School ID is required');
        }
        
        if (!classIdValue) {
            // If no class ID is provided, fall back to getting all school events
            console.log("No valid class ID provided, falling back to all school events");
            return dispatch(getAllEvents(schoolIdValue));
        }
        
        console.log("Fetching class events for school:", schoolIdValue, "class:", classIdValue);
        const response = await axios.get(`${BASE_URL}/Events/${schoolIdValue}/${classIdValue}`);
        console.log("Fetched class events:", response.data);
        dispatch(getEventsSuccess(response.data));
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error fetching class events:", error);
        dispatch(getEventsFailed(error.response?.data?.message || error.message || "Failed to load class events"));
        return { success: false, error: error.response?.data || "Failed to load class events" };
    }
}

export const addEvent = (fields) => async (dispatch) => {
    dispatch(createEventStart());
    try {
        // Ensure dates are properly formatted
        const eventData = { ...fields };
        
        // Make sure the school field is properly set and valid
        eventData.school = extractId(eventData.school);
        if (!eventData.school) {
            throw new Error("School ID is required");
        }
        
        // Validate school ID format
        if (!isValidObjectId(eventData.school)) {
            console.error("Invalid school ID format:", eventData.school);
            throw new Error("Invalid school ID format. Must be a valid MongoDB ObjectID.");
        }
        
        // Process class name
        if (eventData.sclassName) {
            eventData.sclassName = extractId(eventData.sclassName);
        }
        
        // Convert empty sclassName to null for backend compatibility
        if (eventData.sclassName === '' || !eventData.sclassName) {
            eventData.sclassName = null;
        }
        
        console.log("Adding event with fields:", eventData);
        const response = await axios.post(`${BASE_URL}/EventCreate`, eventData);
        console.log("Event creation response:", response.data);
        
        if (response.data && response.data._id) {
            dispatch(createEventSuccess(response.data));
            return { success: true, data: response.data };
        } else {
            console.error("Invalid response data:", response.data);
            dispatch(createEventFailed("Invalid response data"));
            return { success: false, error: "Invalid response data" };
        }
    } catch (error) {
        console.error("Error in addEvent:", error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to create event";
        dispatch(createEventFailed(errorMessage));
        return { success: false, error: errorMessage };
    }
}

export const updateEventDetails = (id, fields) => async (dispatch) => {
    dispatch(updateEventStart());
    try {
        // Validate event ID
        if (!id || !isValidObjectId(id)) {
            throw new Error("Invalid event ID format");
        }
        
        // Handle empty sclassName
        const updatedFields = { ...fields };
        
        // Validate school ID if present
        if (updatedFields.school && !isValidObjectId(updatedFields.school)) {
            throw new Error("Invalid school ID format");
        }
        
        if (updatedFields.sclassName === '') {
            updatedFields.sclassName = null;
        } else if (updatedFields.sclassName && !isValidObjectId(updatedFields.sclassName)) {
            // If sclassName is provided but not a valid ObjectId, handle accordingly
            if (updatedFields.sclassName !== '') {
                console.warn("Invalid class ID format, setting to null:", updatedFields.sclassName);
                updatedFields.sclassName = null;
            }
        }
        
        console.log("Updating event with ID:", id);
        console.log("Updated fields:", updatedFields);
          const response = await axios.put(`${BASE_URL}/Event/${id}`, updatedFields);
        console.log("Event update response:", response.data);
        
        dispatch(updateEventSuccess(response.data));
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error updating event:", error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to update event";
        dispatch(updateEventFailed(errorMessage));
        return { success: false, error: errorMessage };
    }
}

export const deleteEvent = (id) => async (dispatch) => {
    dispatch(deleteEventStart());
    try {
        await axios.delete(`${BASE_URL}/Event/${id}`);
        dispatch(deleteEventSuccess(id));
        return { success: true };
    } catch (error) {
        dispatch(deleteEventFailed(error.response?.data || "Failed to delete event"));
        return { success: false, error: error.response?.data || "Failed to delete event" };
    }
}
