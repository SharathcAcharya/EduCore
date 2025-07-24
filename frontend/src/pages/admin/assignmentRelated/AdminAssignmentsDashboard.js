import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    Box, 
    Typography, 
    Paper, 
    Button, 
    Grid, 
    Card, 
    CardContent, 
    CardActions,
    Alert,
    CircularProgress,
    Chip
} from '@mui/material';
import { Add, Refresh, ArrowBack, Assignment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAllAssignments, deleteAssignment } from '../../../redux/assignmentRelated/assignmentHandle';
import { getAllSubjects } from '../../../redux/subjectRelated/subjectHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import FormDialog from '../../../components/FormDialog';
import AssignmentForm from '../../../components/assignments/AssignmentForm';
import { useAssignmentForm } from '../../../hooks/useAssignmentForm';
import Popup from '../../../components/Popup';

const AdminAssignmentsDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { currentUser } = useSelector((state) => state.user);
    const { assignments, loading, error } = useSelector((state) => state.assignment);
    const { subjects } = useSelector((state) => state.subject);
    const { sclasses } = useSelector((state) => state.sclass);
    
    const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [assignmentToDelete, setAssignmentToDelete] = useState(null);
    
    // Use our custom hook for assignment form handling
    const { 
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
    } = useAssignmentForm(currentUser);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        
        // Get the school ID from current user
        const schoolId = currentUser?._id;
        
        if (!schoolId) {
            setStatusMessage({
                type: 'error',
                message: 'Invalid school ID. Please contact your administrator.'
            });
            return;
        }
        
        // Fetch assignments, subjects, and classes for the school
        dispatch(getAllAssignments(schoolId));
        dispatch(getAllSubjects(schoolId));
        dispatch(getAllSclasses(schoolId));
    }, [dispatch, currentUser, navigate]);
    
    const handleRefresh = () => {
        const schoolId = currentUser?._id;
        if (!schoolId) {
            setStatusMessage({
                type: 'error',
                message: 'Invalid school ID. Please contact your administrator.'
            });
            return;
        }
        
        setStatusMessage({ type: 'info', message: 'Refreshing assignments...' });
        dispatch(getAllAssignments(schoolId))
            .then(() => {
                setStatusMessage({ type: 'success', message: 'Assignments refreshed successfully!' });
                setTimeout(() => setStatusMessage({ type: '', message: '' }), 3000);
            })
            .catch(err => {
                setStatusMessage({ 
                    type: 'error', 
                    message: 'Error refreshing assignments: ' + (err.message || 'Unknown error') 
                });
            });
    };
    
    const confirmDeleteAssignment = (assignmentId) => {
        setAssignmentToDelete(assignmentId);
        setShowDeleteConfirmation(true);
    };
    
    const handleDeleteAssignment = async () => {
        if (!assignmentToDelete) return;
        
        try {
            const result = await dispatch(deleteAssignment(assignmentToDelete));
            
            if (result && result.success) {
                setStatusMessage({
                    type: 'success',
                    message: 'Assignment deleted successfully!'
                });
                
                // Refresh the assignments list
                dispatch(getAllAssignments(currentUser?._id));
            } else {
                setStatusMessage({
                    type: 'error',
                    message: result?.error?.message || 'Failed to delete assignment'
                });
            }
        } catch (error) {
            console.error("Error deleting assignment:", error);
            setStatusMessage({
                type: 'error',
                message: 'An error occurred while deleting the assignment'
            });
        } finally {
            setShowDeleteConfirmation(false);
            setAssignmentToDelete(null);
        }
    };
    
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };
    
    const getStatusColor = (dueDate) => {
        const now = new Date();
        const due = new Date(dueDate);
        
        // Set time to beginning of day for accurate comparison
        now.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);
        
        if (due < now) {
            return '#f44336'; // Red for past due
        } else if (due.getTime() === now.getTime()) {
            return '#ff9800'; // Orange for due today
        } else {
            const diffTime = Math.abs(due - now);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 2) {
                return '#ff9800'; // Orange for due soon (within 2 days)
            } else {
                return '#4caf50'; // Green for future dates
            }
        }
    };
    
    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h4" component="h1">
                            Assignments Dashboard
                        </Typography>
                        <Box>
                            <Button 
                                variant="outlined" 
                                color="secondary" 
                                startIcon={<ArrowBack />}
                                onClick={() => navigate('/Admin/dashboard')}
                                sx={{ mr: 2 }}
                            >
                                Back to Dashboard
                            </Button>
                            <Button 
                                variant="outlined" 
                                color="primary" 
                                startIcon={<Refresh />} 
                                onClick={handleRefresh}
                                sx={{ mr: 2 }}
                            >
                                Refresh
                            </Button>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                startIcon={<Add />} 
                                onClick={handleAddAssignment}
                            >
                                Add New Assignment
                            </Button>
                        </Box>
                    </Box>
                    
                    {statusMessage.message && (
                        <Alert 
                            severity={statusMessage.type || 'info'} 
                            sx={{ mb: 3 }}
                            onClose={() => setStatusMessage({ type: '', message: '' })}
                        >
                            {statusMessage.message}
                        </Alert>
                    )}
                    
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Assignments Overview
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            This dashboard allows you to manage school assignments. You can create, edit, and view assignments for your school.
                        </Typography>
                        
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : error ? (
                            <Alert severity="error" sx={{ my: 2 }}>
                                Error loading assignments: {error}
                            </Alert>
                        ) : assignments && assignments.length > 0 ? (
                            <Grid container spacing={3} sx={{ mt: 2 }}>
                                {assignments.map(assignment => (
                                    <Grid item xs={12} sm={6} md={4} key={assignment._id}>
                                        <Card sx={{ 
                                            height: '100%', 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            borderTop: `4px solid ${getStatusColor(assignment.dueDate)}`
                                        }}>
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <Assignment sx={{ mr: 1, color: 'primary.main' }} />
                                                    <Typography variant="h6" component="h2">
                                                        {assignment.title}
                                                    </Typography>
                                                </Box>
                                                
                                                <Typography variant="body2" color="text.secondary" paragraph>
                                                    {assignment.description.length > 100 
                                                        ? `${assignment.description.substring(0, 100)}...` 
                                                        : assignment.description}
                                                </Typography>
                                                
                                                <Grid container spacing={1} sx={{ mb: 1 }}>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2">
                                                            <strong>Due:</strong> {formatDate(assignment.dueDate)}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2">
                                                            <strong>Max Marks:</strong> {assignment.maxMarks}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                                
                                                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    <Chip 
                                                        label={assignment.subject?.subName || 'Unknown Subject'} 
                                                        size="small" 
                                                        color="primary" 
                                                        variant="outlined"
                                                    />
                                                    <Chip 
                                                        label={assignment.sclassName?.sclassName || 'Unknown Class'} 
                                                        size="small" 
                                                        color="secondary" 
                                                        variant="outlined"
                                                    />
                                                    <Chip 
                                                        label={assignment.assignerModel === 'admin' ? 'Admin' : 'Teacher'} 
                                                        size="small" 
                                                        color="default" 
                                                        variant="outlined"
                                                    />
                                                </Box>
                                            </CardContent>
                                            <CardActions>
                                                <Button 
                                                    size="small" 
                                                    onClick={() => handleEditAssignment(assignment._id, assignments)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button 
                                                    size="small" 
                                                    color="error"
                                                    onClick={() => confirmDeleteAssignment(assignment._id)}
                                                >
                                                    Delete
                                                </Button>
                                                <Button 
                                                    size="small" 
                                                    color="primary"
                                                    onClick={() => navigate(`/Admin/assignments/${assignment._id}`)}
                                                >
                                                    View Details
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Alert severity="info" sx={{ my: 2 }}>
                                No assignments found. Click "Add New Assignment" to create one.
                            </Alert>
                        )}
                    </Paper>
                </Grid>
            </Grid>
            
            <FormDialog
                title={formMode === 'add' ? "Add New Assignment" : "Edit Assignment"}
                openPopup={openPopup}
                setOpenPopup={setOpenPopup}
            >
                <AssignmentForm
                    formData={formData}
                    handleFormChange={handleFormChange}
                    handleSubmit={handleSubmit}
                    subjects={subjects || []}
                    sclasses={sclasses || []}
                    formMode={formMode}
                    isSubmitting={isSubmitting}
                    submitError={submitError}
                    submitSuccess={submitSuccess}
                />
            </FormDialog>
            
            <Popup
                title="Confirm Delete"
                openPopup={showDeleteConfirmation}
                setOpenPopup={setShowDeleteConfirmation}
            >
                <Box sx={{ p: 2 }}>
                    <Typography variant="body1" gutterBottom>
                        Are you sure you want to delete this assignment? This action cannot be undone.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button 
                            variant="outlined" 
                            color="secondary" 
                            onClick={() => setShowDeleteConfirmation(false)}
                            sx={{ mr: 1 }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="contained" 
                            color="error" 
                            onClick={handleDeleteAssignment}
                        >
                            Delete
                        </Button>
                    </Box>
                </Box>
            </Popup>
        </Box>
    );
};

export default AdminAssignmentsDashboard;
