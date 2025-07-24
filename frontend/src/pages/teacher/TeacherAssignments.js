import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    Typography,
    Paper,
    Divider,
    IconButton,    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tooltip,
    Chip,
    Snackbar,
    Alert,
    FormHelperText,
} from '@mui/material';
import { Add, Delete, Assignment, School, Subject, DateRange } from '@mui/icons-material';
import { getTeacherAssignments, addAssignment, deleteAssignment } from '../../redux/assignmentRelated/assignmentHandle';
import { getSubjectsByClass } from '../../redux/subjectRelated/subjectHandle';
import Popup from '../../components/Popup';
import CircularProgress from '@mui/material/CircularProgress';

const TeacherAssignments = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { assignments, loading, error } = useSelector((state) => state.assignment);
    const { subjects } = useSelector((state) => state.subject);    const [openPopup, setOpenPopup] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', subtitle: '' });
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        sclassName: '',
        dueDate: '',
        maxMarks: 100,
        school: '',
        assignedBy: '',
        assignerModel: 'teacher'
    });
    
    // Update form data when currentUser changes
    useEffect(() => {
        if (currentUser) {
            setFormData(prevData => ({
                ...prevData,
                subject: currentUser?.teachSubject?._id || '',
                sclassName: currentUser?.teachSclass?._id || '',
                school: currentUser?.school || '',
                assignedBy: currentUser?._id || ''
            }));
        }
    }, [currentUser]);useEffect(() => {
        if (currentUser?._id) {
            console.log("Teacher fetching assignments:", currentUser._id);
            dispatch(getTeacherAssignments(currentUser._id));
            
            // Fetch subjects for the teacher's assigned class
            if (currentUser?.teachSclass?._id && currentUser?.school) {
                console.log("Fetching subjects for class:", currentUser.teachSclass._id, "in school:", currentUser.school);
                dispatch(getSubjectsByClass({ 
                    schoolId: currentUser.school, 
                    classId: currentUser.teachSclass._id 
                }));
            }
        }
    }, [dispatch, currentUser]);    const resetFormData = () => {
        setFormData({
            title: '',
            description: '',
            subject: currentUser?.teachSubject?._id || '',
            sclassName: currentUser?.teachSclass?._id || '',
            dueDate: '',
            maxMarks: 100,
            school: currentUser?.school || '',
            assignedBy: currentUser?._id || '',
            assignerModel: 'teacher'
        });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddAssignment = () => {
        // Verify teacher has required data
        if (!currentUser?.school || !currentUser?.teachSclass?._id) {
            setNotification({
                open: true,
                message: 'You need to be assigned to a class before creating assignments',
                severity: 'error'
            });
            return;
        }
        
        resetFormData();
        setOpenPopup(true);
    };const handleDeleteAssignment = (assignmentId) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Are you sure you want to delete this assignment?',
            subtitle: "You can't undo this operation",
            onConfirm: async () => {
                try {
                    const result = await dispatch(deleteAssignment(assignmentId));
                    
                    if (result && result.success) {
                        setNotification({
                            open: true,
                            message: 'Assignment deleted successfully!',
                            severity: 'success'
                        });
                        
                        // Refresh the assignments list
                        dispatch(getTeacherAssignments(currentUser._id));
                    } else {
                        setNotification({
                            open: true,
                            message: result?.error?.message || 'Failed to delete assignment',
                            severity: 'error'
                        });
                    }
                } catch (error) {
                    console.error("Error deleting assignment:", error);
                    setNotification({
                        open: true,
                        message: 'An error occurred while deleting the assignment',
                        severity: 'error'
                    });
                }
                
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            }
        });
    };    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Enhanced validation
        const errors = [];
        
        if (!formData.title.trim()) errors.push("Title is required");
        if (!formData.description.trim()) errors.push("Description is required");
        if (!formData.subject) errors.push("Subject is required");
        if (!formData.sclassName) errors.push("Class is required");
        if (!formData.dueDate) errors.push("Due date is required");
        if (!formData.maxMarks || formData.maxMarks < 1) errors.push("Maximum marks must be at least 1");
        
        // Check if due date is in the past
        const dueDate = new Date(formData.dueDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Reset time part for accurate date comparison
        
        if (dueDate < now) {
            errors.push("Due date cannot be in the past");
        }
        
        if (errors.length > 0) {
            setNotification({
                open: true,
                message: errors.join(", "),
                severity: 'error'
            });
            return;
        }
        
        // Ensure maxMarks is a number
        const submissionData = {
            ...formData,
            maxMarks: Number(formData.maxMarks) || 100
        };
        
        console.log("Teacher submitting assignment data:", submissionData);
        
        try {
            const result = await dispatch(addAssignment(submissionData));
            
            if (result && result.success) {
                setNotification({
                    open: true,
                    message: 'Assignment created successfully!',
                    severity: 'success'
                });
                setOpenPopup(false);
                resetFormData();
                
                // Refresh the assignments list
                dispatch(getTeacherAssignments(currentUser._id));
            } else {
                setNotification({
                    open: true,
                    message: result?.error?.message || 'Failed to create assignment',
                    severity: 'error'
                });
            }
        } catch (error) {
            console.error("Error submitting assignment:", error);
            setNotification({
                open: true,
                message: 'An error occurred while creating the assignment',
                severity: 'error'
            });
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (dueDate) => {
        const now = new Date();
        const due = new Date(dueDate);
        
        if (due < now) {
            return '#f44336'; // red for past due
        } else if ((due - now) / (1000 * 60 * 60 * 24) < 3) {
            return '#ff9800'; // orange for approaching
        } else {
            return '#4caf50'; // green for plenty of time
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <Grid container justifyContent="space-between" alignItems="center" mb={3}>
                <Grid item>
                    <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Assignment sx={{ mr: 1 }} />
                        My Class Assignments
                    </Typography>
                </Grid>
                <Grid item>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        onClick={handleAddAssignment}
                    >
                        Create Assignment
                    </Button>
                </Grid>
            </Grid>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" color="error">{error}</Typography>
                </Paper>
            ) : assignments && assignments.length > 0 ? (
                <Grid container spacing={3}>
                    {assignments.map((assignment) => (
                        <Grid item xs={12} sm={6} md={4} key={assignment._id}>
                            <Card 
                                elevation={3}
                                sx={{ 
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                    }
                                }}
                                onClick={() => navigate(`/Teacher/assignments/${assignment._id}`)}
                            >
                                <Box 
                                    sx={{ 
                                        p: 2, 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                                    }}
                                >
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {assignment.title}
                                    </Typography>
                                    <Tooltip title="Delete Assignment">
                                        <IconButton 
                                            color="error" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteAssignment(assignment._id);
                                            }}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {assignment.description.length > 150
                                            ? `${assignment.description.substring(0, 150)}...`
                                            : assignment.description}
                                    </Typography>
                                    
                                    <Grid container spacing={1} sx={{ mt: 2 }}>                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <School fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                                                <Typography variant="body2">
                                                    Class: {assignment.sclassName && assignment.sclassName.sclassName 
                                                        ? assignment.sclassName.sclassName 
                                                        : currentUser?.teachSclass?.sclassName || 'Unknown Class'}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Subject fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                                                <Typography variant="body2">
                                                    Subject: {assignment.subject && assignment.subject.subName 
                                                        ? assignment.subject.subName 
                                                        : currentUser?.teachSubject?.subName || 'Unknown Subject'}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <DateRange fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                                                <Typography variant="body2">
                                                    Due: {formatDate(assignment.dueDate)}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                                <Divider />                                <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Chip 
                                        label={`Max Marks: ${assignment.maxMarks}`} 
                                        size="small" 
                                        sx={{ bgcolor: 'rgba(0, 0, 0, 0.08)' }} 
                                    />
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Chip 
                                            label={assignment.assignerModel === 'admin' ? "Created by Admin" : "Created by You"} 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: assignment.assignerModel === 'admin' ? 'rgba(156, 39, 176, 0.1)' : 'rgba(33, 150, 243, 0.1)',
                                                color: assignment.assignerModel === 'admin' ? '#9c27b0' : '#2196f3'
                                            }} 
                                        />
                                        <Chip 
                                            label={new Date(assignment.dueDate) < new Date() ? "Past Due" : "Active"} 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: getStatusColor(assignment.dueDate),
                                                color: 'white'
                                            }} 
                                        />
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6">No Assignments Found</Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                        You haven't created any assignments yet. Create your first assignment using the button above.
                    </Typography>
                </Paper>
            )}

            <Popup
                title="Create New Assignment"
                openPopup={openPopup}
                setOpenPopup={setOpenPopup}
            >
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>                        <Grid item xs={12}>
                            <TextField
                                name="title"
                                label="Assignment Title"
                                value={formData.title}
                                onChange={handleFormChange}
                                fullWidth
                                required
                                error={formData.title === ''}
                                helperText={formData.title === '' ? 'Title is required' : ''}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="description"
                                label="Assignment Description"
                                value={formData.description}
                                onChange={handleFormChange}
                                fullWidth
                                multiline
                                rows={4}
                                required
                                error={formData.description === ''}
                                helperText={formData.description === '' ? 'Description is required' : ''}
                            />
                        </Grid>                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Subject</InputLabel>
                                <Select
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleFormChange}
                                    label="Subject"
                                    error={!formData.subject}
                                >
                                    {subjects && subjects.length > 0 ? (
                                        subjects.map((subject) => (
                                            <MenuItem key={subject._id} value={subject._id}>
                                                {subject.subName}
                                            </MenuItem>
                                        ))
                                    ) : currentUser?.teachSubject?._id ? (
                                        <MenuItem value={currentUser.teachSubject._id}>
                                            {currentUser.teachSubject.subName}
                                        </MenuItem>
                                    ) : (
                                        <MenuItem disabled>No subjects available</MenuItem>
                                    )}
                                </Select>
                                {!formData.subject && (
                                    <FormHelperText error>Subject is required</FormHelperText>
                                )}
                            </FormControl>
                        </Grid><Grid item xs={12} sm={6}>
                            <TextField
                                name="dueDate"
                                label="Due Date"
                                type="date"
                                value={formData.dueDate}
                                onChange={handleFormChange}
                                fullWidth
                                required
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    min: new Date().toISOString().split('T')[0] // Set min date to today
                                }}
                                error={formData.dueDate === ''}
                                helperText={formData.dueDate === '' ? 'Due date is required' : ''}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="maxMarks"
                                label="Maximum Marks"
                                type="number"
                                value={formData.maxMarks}
                                onChange={handleFormChange}
                                fullWidth
                                required
                                InputProps={{
                                    inputProps: { min: 1, max: 100 }
                                }}
                                error={!formData.maxMarks || formData.maxMarks < 1}
                                helperText={!formData.maxMarks || formData.maxMarks < 1 ? 'Maximum marks must be at least 1' : ''}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                            >
                                Create Assignment
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Popup>

            <Dialog
                open={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
            >
                <DialogTitle>{confirmDialog.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{confirmDialog.subtitle}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                        color="primary"
                    >
                        Cancel
                    </Button>
                    <Button onClick={confirmDialog.onConfirm} color="error">
                        Delete
                    </Button>            </DialogActions>
            </Dialog>

            {/* Notification Snackbar */}
            <Snackbar 
                open={notification.open} 
                autoHideDuration={6000} 
                onClose={() => setNotification({...notification, open: false})}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={() => setNotification({...notification, open: false})} 
                    severity={notification.severity} 
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TeacherAssignments;
