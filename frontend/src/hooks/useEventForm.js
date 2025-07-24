import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addEvent, updateEventDetails, getAllEvents } from '../redux/eventRelated/eventHandle';
import { isValidObjectId, formatEventDates } from '../utils/eventUtils';

/**
 * Custom hook to manage event form state and submission
 * @param {Object} currentUser - The current user object
 * @returns {Object} - The form state and handlers
 */
export const useEventForm = (currentUser) => {
    const dispatch = useDispatch();
    const [formMode, setFormMode] = useState('add');
    const [currentEventId, setCurrentEventId] = useState(null);
    const [openPopup, setOpenPopup] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(null);
    
    // Initialize form data with default values
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000), // tomorrow
        eventType: 'Meeting',
        sclassName: '',
        school: currentUser?.school || currentUser?._id,
        createdBy: currentUser?.name || 'Admin'
    });
    
    // Reset form data to defaults
    const resetFormData = () => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        setFormData({
            title: '',
            description: '',
            startDate: today,
            endDate: tomorrow,
            eventType: 'Meeting',
            sclassName: '',
            school: currentUser?.school || currentUser?._id,
            createdBy: currentUser?.name || 'Admin'
        });
        setFormMode('add');
        setCurrentEventId(null);
        setSubmitError(null);
        setSubmitSuccess(null);
    };
    
    // Open the form for adding a new event
    const handleAddEvent = () => {
        resetFormData();
        setOpenPopup(true);
    };
    
    // Handle form field changes
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        
        console.log(`Form field changed: ${name} = ${value}`);
        
        // Special handling for date fields
        if (name === 'startDate' || name === 'endDate') {
            const dateValue = new Date(value);
            console.log(`Converting ${name} to Date object:`, dateValue);
            
            if (name === 'startDate') {
                // If start date changes, ensure end date is not before it
                const currentEndDate = new Date(formData.endDate);
                if (dateValue > currentEndDate) {
                    // If end date is before new start date, update end date to be one day after start date
                    const newEndDate = new Date(dateValue);
                    newEndDate.setDate(newEndDate.getDate() + 1);
                    setFormData({ 
                        ...formData, 
                        [name]: dateValue,
                        endDate: newEndDate
                    });
                    return;
                }
            }
            
            setFormData({ ...formData, [name]: dateValue });
        } 
        // Special handling for sclassName field
        else if (name === 'sclassName') {
            console.log(`Setting class name to: ${value || 'null (All Classes)'}`);
            setFormData({ ...formData, [name]: value });
        }
        // Default handling for other fields
        else {
            setFormData({ ...formData, [name]: value });
        }
    };
    
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(null);
        
        // Validate dates
        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            setSubmitError("End date cannot be before start date");
            setIsSubmitting(false);
            return;
        }
        
        // Make a copy of the form data to avoid mutating the state directly
        let submitData = { ...formData };
        
        // Format dates using our utility function
        submitData = formatEventDates(submitData);
        
        // Ensure school ID is set and valid
        if (!submitData.school) {
            submitData.school = currentUser?.school || currentUser?._id;
        }
        
        // Validate school ID
        if (!isValidObjectId(submitData.school)) {
            console.error("Invalid school ID:", submitData.school);
            setSubmitError("Invalid school ID format. Please contact your administrator.");
            setIsSubmitting(false);
            return;
        }
        
        // Ensure creator is set
        if (!submitData.createdBy) {
            submitData.createdBy = currentUser?.name || 'Admin';
        }
        
        console.log("Submitting event with data:", submitData);
        
        try {
            let result;
            let successMessage;
            
            if (formMode === 'add') {
                console.log("Adding new event");
                result = await dispatch(addEvent(submitData));
                successMessage = "Event created successfully!";
            } else if (formMode === 'edit' && currentEventId) {
                console.log("Updating event with ID:", currentEventId);
                result = await dispatch(updateEventDetails(currentEventId, submitData));
                successMessage = "Event updated successfully!";
            }
            
            console.log("Submission result:", result);
            
            if (result && result.success) {
                setSubmitSuccess(successMessage);
                
                // Close the popup after a short delay to show the success message
                setTimeout(() => {
                    setOpenPopup(false);
                    resetFormData();
                }, 1500);
                
                // Refresh the events list
                const schoolId = currentUser?.school || currentUser?._id;
                console.log("Refreshing events for school ID:", schoolId);
                dispatch(getAllEvents(schoolId));
            } else if (result && !result.success) {
                setSubmitError(result.error || 'Unknown error occurred');
            } else {
                setSubmitError("No response received from server. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting event:", error);
            setSubmitError("An error occurred while saving the event. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Handle editing an existing event
    const handleEditEvent = (eventId, events) => {
        if (!events || !events.length) {
            console.error("Events array is undefined or empty");
            return;
        }
        
        const eventToEdit = events.find(event => event._id === eventId);
        if (eventToEdit) {
            console.log("Editing event:", eventToEdit);
            const startDate = eventToEdit.startDate ? new Date(eventToEdit.startDate) : new Date();
            const endDate = eventToEdit.endDate ? new Date(eventToEdit.endDate) : new Date();
            
            // Handle the sclassName field correctly
            let sclassId = '';
            if (eventToEdit.sclassName) {
                // Check if sclassName is a string ID or an object with an _id property
                sclassId = typeof eventToEdit.sclassName === 'string' 
                    ? eventToEdit.sclassName 
                    : eventToEdit.sclassName._id || '';
            }
            
            setFormData({
                title: eventToEdit.title || '',
                description: eventToEdit.description || '',
                startDate: startDate,
                endDate: endDate,
                eventType: eventToEdit.eventType || 'Meeting',
                sclassName: sclassId,
                school: eventToEdit.school || currentUser?.school || currentUser?._id,
                createdBy: eventToEdit.createdBy || currentUser?.name || ''
            });
            
            setFormMode('edit');
            setCurrentEventId(eventId);
            setOpenPopup(true);
            setSubmitError(null);
            setSubmitSuccess(null);
        } else {
            console.error("Event not found with ID:", eventId);
            setSubmitError("Event not found. Please refresh the page and try again.");
        }
    };
    
    return {
        formData,
        formMode,
        openPopup,
        isSubmitting,
        submitError,
        submitSuccess,
        currentEventId,
        setFormData,
        setOpenPopup,
        resetFormData,
        handleFormChange,
        handleSubmit,
        handleAddEvent,
        handleEditEvent
    };
};
