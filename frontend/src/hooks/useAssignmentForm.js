import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addAssignment, updateAssignment } from '../../redux/assignmentRelated/assignmentHandle';

/**
 * Custom hook for managing assignment form state and operations
 * @param {Object} currentUser - The current logged in user
 * @returns {Object} Object containing form state and handlers
 */
export const useAssignmentForm = (currentUser) => {
    const dispatch = useDispatch();
    
    // Initialize the form data with default values and user context
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        sclassName: '',
        dueDate: '',
        maxMarks: 100,
        school: '',
        assignedBy: '',
        assignerModel: currentUser?.role === 'Admin' ? 'admin' : 'teacher'
    });
    
    const [openPopup, setOpenPopup] = useState(false);
    const [formMode, setFormMode] = useState('add');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(null);
    
    // Update form data when currentUser changes
    useEffect(() => {
        if (currentUser) {
            setFormData(prevData => ({
                ...prevData,
                school: currentUser?.school || currentUser?._id || '',
                assignedBy: currentUser?._id || '',
                assignerModel: currentUser?.role === 'Admin' ? 'admin' : 'teacher',
                // For teachers, prefill the class and subject if assigned
                ...(currentUser?.role === 'Teacher' && {
                    subject: currentUser?.teachSubject?._id || '',
                    sclassName: currentUser?.teachSclass?._id || ''
                })
            }));
        }
    }, [currentUser]);
    
    // Reset form to initial state
    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            subject: currentUser?.role === 'Teacher' ? currentUser?.teachSubject?._id || '' : '',
            sclassName: currentUser?.role === 'Teacher' ? currentUser?.teachSclass?._id || '' : '',
            dueDate: '',
            maxMarks: 100,
            school: currentUser?.school || currentUser?._id || '',
            assignedBy: currentUser?._id || '',
            assignerModel: currentUser?.role === 'Admin' ? 'admin' : 'teacher'
        });
        setSubmitError(null);
        setSubmitSuccess(null);
    };
    
    // Handle form field changes
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(null);
        
        try {
            // Validate the form data
            const errors = [];
            
            if (!formData.title.trim()) errors.push("Title is required");
            if (!formData.description.trim()) errors.push("Description is required");
            if (!formData.subject) errors.push("Subject is required");
            if (!formData.sclassName) errors.push("Class is required");
            if (!formData.dueDate) errors.push("Due date is required");
            
            // Validate due date is not in the past
            const dueDate = new Date(formData.dueDate);
            const now = new Date();
            now.setHours(0, 0, 0, 0); // Reset time part for accurate date comparison
            
            if (dueDate < now) {
                errors.push("Due date cannot be in the past");
            }
            
            if (errors.length > 0) {
                setSubmitError(errors.join(", "));
                setIsSubmitting(false);
                return;
            }
            
            // Format the data for submission
            const submissionData = {
                ...formData,
                maxMarks: Number(formData.maxMarks) || 100
            };
            
            let result;
            
            if (formMode === 'add') {
                result = await dispatch(addAssignment(submissionData));
            } else {
                result = await dispatch(updateAssignment(formData._id, submissionData));
            }
            
            if (result && result.success) {
                setSubmitSuccess(formMode === 'add' 
                    ? 'Assignment created successfully!' 
                    : 'Assignment updated successfully!');
                
                // Close the popup after a delay on success
                setTimeout(() => {
                    setOpenPopup(false);
                    resetForm();
                }, 1500);
            } else {
                setSubmitError(result?.error?.message || 'An error occurred. Please try again.');
            }
        } catch (error) {
            console.error('Assignment form submission error:', error);
            setSubmitError(error.message || 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Handler for adding a new assignment
    const handleAddAssignment = () => {
        setFormMode('add');
        resetForm();
        setOpenPopup(true);
    };
    
    // Handler for editing an existing assignment
    const handleEditAssignment = (assignmentId, assignments) => {
        const assignmentToEdit = assignments.find(a => a._id === assignmentId);
        
        if (!assignmentToEdit) {
            console.error('Assignment not found:', assignmentId);
            return;
        }
        
        setFormMode('edit');
        setFormData({
            ...assignmentToEdit,
            subject: assignmentToEdit.subject?._id || assignmentToEdit.subject,
            sclassName: assignmentToEdit.sclassName?._id || assignmentToEdit.sclassName,
            dueDate: new Date(assignmentToEdit.dueDate).toISOString().split('T')[0]
        });
        setOpenPopup(true);
    };
    
    return {
        formData,
        openPopup,
        formMode,
        isSubmitting,
        submitError,
        submitSuccess,
        setOpenPopup,
        handleFormChange,
        handleSubmit,
        handleAddAssignment,
        handleEditAssignment
    };
};
