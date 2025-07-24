// This file provides diagnostic tools for identifying issues with event loading
import axios from 'axios';
import { BASE_URL } from '../config';
import { extractId } from './idExtractor';

/**
 * Check if events are loading properly for a specific user
 * @param {Object} currentUser - The current user object with role, school, and class information
 * @returns {Promise<Object>} - Result object with success status, event counts, and any error messages
 */
export const diagnoseSclassEvents = async (currentUser) => {
    if (!currentUser) {
        return { success: false, error: 'No user data available' };
    }
    
    console.group('Event Diagnostics');
    console.log('User type:', currentUser.role);
    
    // Get school ID
    const schoolId = extractId(currentUser.school);
    if (!schoolId) {
        console.error('No valid school ID found:', currentUser.school);
        console.groupEnd();
        return { success: false, error: 'No valid school ID found' };
    }    console.log('School ID:', schoolId);
    
    // Get class ID based on user role
    let classId = null;
    if (currentUser.role === 'Student') {
        classId = extractId(currentUser.sclassName);
        console.log('Student class ID:', classId);
    } else if (currentUser.role === 'Teacher') {
        classId = extractId(currentUser.teachSclass);
        console.log('Teacher class ID:', classId);
    } else if (currentUser.role === 'Admin') {
        // Admin doesn't have a specific class - they can see all school events
        console.log('Admin user - no specific class ID');
    } else {
        console.log('Unknown user role:', currentUser.role);
    }
    
    // Variable to store school events data
    let schoolEventsData = [];
    
    // Test school events
    try {
        console.log('Testing school events API...');
        const schoolEventsResponse = await axios.get(`${BASE_URL}/Events/${schoolId}`);
        schoolEventsData = schoolEventsResponse.data;
        console.log('School events result:', 
            Array.isArray(schoolEventsResponse.data) 
                ? `${schoolEventsResponse.data.length} events found` 
                : 'No array received');
    } catch (error) {
        console.error('Error fetching school events:', error.message);
        // If no class ID, return error immediately since we can't proceed
        if (!classId) {
            console.groupEnd();
            return { success: false, error: `Error fetching school events: ${error.message}` };
        }
    }
    
    // Test class events if applicable
    if (classId) {
        try {
            console.log('Testing class events API...');
            const classEventsResponse = await axios.get(`${BASE_URL}/Events/${schoolId}/${classId}`);
            console.log('Class events result:', 
                Array.isArray(classEventsResponse.data) 
                    ? `${classEventsResponse.data.length} events found` 
                    : 'No array received');
            
            console.groupEnd();
            return { 
                success: true, 
                schoolEvents: Array.isArray(schoolEventsData) ? schoolEventsData.length : 0,
                classEvents: Array.isArray(classEventsResponse.data) ? classEventsResponse.data.length : 0
            };
        } catch (error) {
            console.error('Error fetching class events:', error.message);            console.groupEnd();
            return { success: false, error: `Error fetching class events: ${error.message}` };
        }
    }
    
    console.groupEnd();
    return { 
        success: true, 
        message: 'Only school events tested (no class ID available)',
        schoolEvents: Array.isArray(schoolEventsData) ? schoolEventsData.length : 0
    };
};

/**
 * Validate an event before submission
 * @param {Object} eventData - The event data to validate
 * @returns {Object} - Object with isValid boolean and errors object containing validation messages
 */
export const validateEventData = (eventData) => {
    const errors = {};
    
    if (!eventData.title || eventData.title.trim() === '') {
        errors.title = 'Title is required';
    }
    
    if (!eventData.description || eventData.description.trim() === '') {
        errors.description = 'Description is required';
    }
    
    if (!eventData.startDate) {
        errors.startDate = 'Start date is required';
    } else if (isNaN(new Date(eventData.startDate).getTime())) {
        errors.startDate = 'Invalid start date format';
    }
    
    if (!eventData.endDate) {
        errors.endDate = 'End date is required';
    } else if (isNaN(new Date(eventData.endDate).getTime())) {
        errors.endDate = 'Invalid end date format';
    }
    
    if (eventData.startDate && eventData.endDate) {
        if (new Date(eventData.startDate) > new Date(eventData.endDate)) {
            errors.dateRange = 'End date must be after start date';
        }
    }
    
    if (!eventData.eventType) {
        errors.eventType = 'Event type is required';
    }
    
    if (!eventData.school) {
        errors.school = 'School ID is required';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
