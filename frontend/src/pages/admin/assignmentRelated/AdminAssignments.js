// filepath: e:\mca final\MERN-School-Management-System\frontend\src\pages\admin\assignmentRelated\AdminAssignments.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    Typography,
    Paper,
    Divider,
    IconButton,
    Dialog,
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
    CircularProgress
} from '@mui/material';
import { Add, Delete, Edit, Assignment, School, Class, Subject, DateRange, Person, BugReport, Refresh } from '@mui/icons-material';
import { getAllAssignments, addAssignment, deleteAssignment } from '../../../redux/assignmentRelated/assignmentHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { getAllSubjects } from '../../../redux/subjectRelated/subjectHandle';
import { BASE_URL } from '../../../config';

const AdminAssignments = () => {    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { assignments = [], loading, error } = useSelector((state) => state.assignment || {});
    const { sclassesList = [] } = useSelector((state) => state.sclass || {});
    const { subjects = [] } = useSelector((state) => state.subject || {});

    const [openPopup, setOpenPopup] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', subtitle: '' });
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        sclassName: '',
        dueDate: '',
        maxMarks: 100,
        school: currentUser?.school || currentUser?._id,
        assignedBy: currentUser?._id,
        assignerModel: 'admin'
    });
    const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // For Admin users, if school is not set, use their _id as the school identifier
        const schoolId = currentUser?.school || currentUser?._id;

        if (!schoolId) {
            console.error('School ID not found');
            setNotification({
                show: true,
                message: 'School ID not found. Cannot load assignments.',
                type: 'error'
            });
            return;
        }

        console.log("Admin fetching assignments with school ID:", schoolId);

        // Fetch resources and handle potential failures
        const fetchData = async () => {
            try {
                // First fetch classes and subjects to ensure they're available for the form
                console.log("Fetching classes and subjects...");

                // Fetch classes
                try {
                    console.log("Fetching all classes for school:", schoolId);
                    dispatch(getAllSclasses(schoolId));
                } catch (error) {
                    console.error("Error fetching classes:", error);
                    setNotification({
                        show: true,
                        message: 'Failed to load classes. Please try again.',
                        type: 'error'
                    });
                }

                // Fetch subjects
                try {
                    console.log("Fetching all subjects for school:", schoolId);
                    dispatch(getAllSubjects(schoolId));
                } catch (error) {
                    console.error("Error fetching subjects:", error);
                    setNotification({
                        show: true,
                        message: 'Failed to load subjects. Please try again.',
                        type: 'error'
                    });
                }

                // Fetch assignments
                try {
                    console.log("Fetching all assignments for school:", schoolId);
                    dispatch(getAllAssignments(schoolId));
                } catch (error) {
                    console.error("Error fetching assignments:", error);
                    setNotification({
                        show: true,
                        message: 'Failed to load assignments. Please try again.',
                        type: 'error'
                    });
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setNotification({
                    show: true,
                    message: 'An error occurred while loading data.',
                    type: 'error'
                });
            }
        };

        fetchData();
    }, [dispatch, currentUser, refreshTrigger]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log(`Input changed: ${name} = ${value}`);
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form data
        if (!formData.title || !formData.description || !formData.subject ||
            !formData.sclassName || !formData.dueDate) {
            setNotification({
                show: true,
                message: 'Please fill all required fields',
                type: 'error'
            });
            return;
        }

        // Ensure maxMarks is a number
        const submissionData = {
            ...formData,
            maxMarks: Number(formData.maxMarks) || 100
        };

        console.log("Submitting assignment data:", submissionData);
        setSubmitting(true);

        try {
            const result = await dispatch(addAssignment(submissionData));
            setSubmitting(false);

            if (result && result.success) {
                setNotification({
                    show: true,
                    message: 'Assignment created successfully!',
                    type: 'success'
                });

                // Reset form data
                setFormData({
                    title: '',
                    description: '',
                    subject: '',
                    sclassName: '',
                    dueDate: '',
                    maxMarks: 100,
                    school: currentUser?.school || currentUser?._id,
                    assignedBy: currentUser?._id,
                    assignerModel: 'admin'
                });                // Close the popup
                console.log("Closing dialog after successful submission");
                handleClosePopup();

                // Refresh the assignments list
                setRefreshTrigger(prev => prev + 1);
            } else {
                setNotification({
                    show: true,
                    message: result?.error?.message || 'Failed to create assignment',
                    type: 'error'
                });
            }
        } catch (error) {
            setSubmitting(false);
            console.error("Error submitting assignment:", error);
            setNotification({
                show: true,
                message: 'An error occurred while creating the assignment',
                type: 'error'
            });
        }
    };

    const handleDelete = (id) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Are you sure you want to delete this assignment?',
            subtitle: "You can't undo this operation",
            onConfirm: () => {
                deleteAssignmentHandler(id);
            }
        });
    };

    const deleteAssignmentHandler = async (id) => {
        try {
            const result = await dispatch(deleteAssignment(id));

            if (result && result.success) {
                setNotification({
                    show: true,
                    message: 'Assignment deleted successfully!',
                    type: 'success'
                });

                // Refresh the assignments list
                setRefreshTrigger(prev => prev + 1);
            } else {
                setNotification({
                    show: true,
                    message: result?.error?.message || 'Failed to delete assignment',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error("Error deleting assignment:", error);
            setNotification({
                show: true,
                message: 'An error occurred while deleting the assignment',
                type: 'error'
            });
        }

        setConfirmDialog({ ...confirmDialog, isOpen: false });
    };

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
        setNotification({
            show: true,
            message: 'Refreshing data...',
            type: 'info'
        });
    };    // Function to handle closing notifications
    const handleCloseNotification = () => {
        setNotification({ ...notification, show: false });
    };
   
    // Function to handle opening the dialog
    const handleOpenPopup = () => {
        console.log("handleOpenPopup called");
        setOpenPopup(true);
    };

    // Function to handle closing the dialog
    const handleClosePopup = () => {
        console.log("handleClosePopup called");
        setOpenPopup(false);
    };

    // Function to format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };    // Get subject name from ID
    const getSubjectName = (subjectId) => {
        const subject = subjects.find(subject => subject._id === subjectId);
        return subject ? subject.subName : 'Unknown Subject';
    };

    // Get class name from ID
    const getClassName = (classId) => {
        const sclass = sclassesList.find(sclass => sclass._id === classId);
        return sclass ? sclass.sclassName : 'Unknown Class';
    };

    useEffect(() => {
        console.log("openPopup state changed:", openPopup);
    }, [openPopup]);    // Add debug useEffect to check subjects state
    useEffect(() => {
        console.log("Current subjects list:", subjects);
    }, [subjects]);

    // Add styles to document for proper dialog rendering
    useEffect(() => {
        if (openPopup) {
            // When dialog opens, prevent body from clipping dialog
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
        } else {
            // Restore normal scrolling when dialog closes
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
        }
        
        return () => {
            // Clean up on component unmount
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
        };
    }, [openPopup]);

    return (
        <Box sx={{ mt: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
                    <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Assignments Management
                </Typography>

                <Box>                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        onClick={handleOpenPopup}
                        sx={{ mr: 1 }}
                    >
                        Create Assignment
                    </Button>

                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<Refresh />}
                        onClick={handleRefresh}
                    >
                        Refresh
                    </Button>
                </Box>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            ) : assignments.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" color="textSecondary">
                        No assignments found
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Create your first assignment by clicking the "Create Assignment" button above.
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {assignments.map((assignment) => (
                        <Grid item xs={12} sm={6} md={4} key={assignment._id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)'
                                    }
                                }}
                            >
                                <Box
                                    sx={{
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        p: 2,
                                        borderTopLeftRadius: '4px',
                                        borderTopRightRadius: '4px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {assignment.title}
                                    </Typography>
                                    <Box>
                                        <Tooltip title="Delete Assignment">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDelete(assignment._id)}
                                                sx={{ color: 'white' }}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>

                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxHeight: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {assignment.description}
                                    </Typography>

                                    <Grid container spacing={1} sx={{ mb: 1 }}>
                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Class sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                                                <Typography variant="body2">
                                                    Class: {assignment.sclassName && assignment.sclassName.sclassName ?
                                                        assignment.sclassName.sclassName :
                                                        getClassName(assignment.sclassName)}
                                                </Typography>
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Subject sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                                                <Typography variant="body2">
                                                    Subject: {assignment.subject && assignment.subject.subName ?
                                                        assignment.subject.subName :
                                                        getSubjectName(assignment.subject)}
                                                </Typography>
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <DateRange sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                                                <Typography variant="body2">
                                                    Due Date: {formatDate(assignment.dueDate)}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    <Divider sx={{ my: 1 }} />

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                        <Chip
                                            label={`Max Marks: ${assignment.maxMarks}`}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
            {/* Create Assignment Dialog */}            <Dialog
                open={openPopup}
                onClose={handleClosePopup}
                maxWidth="md"
                fullWidth
                sx={{ 
                    zIndex: 1500,
                    '& .MuiPopover-root': {
                        zIndex: 1600
                    },
                    '& .MuiDialog-paper': {
                        overflow: 'visible'
                    }
                }}
            >
                <DialogTitle 
                    sx={{ 
                        borderBottom: '1px solid #e0e0e0',
                        pb: 2,
                        fontSize: '1.25rem',
                        fontWeight: 600
                    }}
                >
                    Create New Assignment
                </DialogTitle>
                <DialogContent 
                    sx={{ 
                        pt: 3, 
                        pb: 3,
                        overflow: 'visible', // Allow dropdowns to extend outside the DialogContent
                        position: 'relative' // Create a new stacking context
                    }}
                >
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3} sx={{ mt: 0 }}>                            <Grid item xs={12}>
                                <TextField
                                    name="title"
                                    label="Assignment Title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    fullWidth
                                    required
                                    variant="outlined"
                                    sx={{ mb: 1 }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    name="description"
                                    label="Description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    fullWidth
                                    multiline
                                    rows={4}
                                    required
                                    variant="outlined"
                                    sx={{ mb: 1 }}
                                />
                            </Grid>                            <Grid item xs={12} sm={6}>                                <FormControl fullWidth required variant="outlined" sx={{ mb: 1 }}>
                                    <InputLabel>Class</InputLabel>
                                    <Select
                                        name="sclassName"
                                        value={formData.sclassName}
                                        onChange={handleInputChange}
                                        label="Class"
                                        MenuProps={{
                                            sx: { zIndex: 9999 },
                                            anchorOrigin: {
                                                vertical: 'bottom',
                                                horizontal: 'left',
                                            },
                                            transformOrigin: {
                                                vertical: 'top',
                                                horizontal: 'left',
                                            },
                                            PaperProps: {
                                                sx: {
                                                    maxHeight: 300,
                                                    zIndex: 9999
                                                }
                                            }
                                        }}
                                    >
                                        {sclassesList && sclassesList.length > 0 ? (
                                            sclassesList.map((sclass) => (
                                                <MenuItem key={sclass._id} value={sclass._id}>
                                                    {sclass.sclassName}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled>No classes available</MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>                                <FormControl fullWidth required variant="outlined" sx={{ mb: 1 }}>
                                    <InputLabel>Subject</InputLabel>
                                    <Select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        label="Subject"
                                        MenuProps={{
                                            sx: { zIndex: 9999 },
                                            anchorOrigin: {
                                                vertical: 'bottom',
                                                horizontal: 'left',
                                            },
                                            transformOrigin: {
                                                vertical: 'top',
                                                horizontal: 'left',
                                            },
                                            PaperProps: {
                                                sx: {
                                                    maxHeight: 300,
                                                    zIndex: 9999
                                                }
                                            }
                                        }}
                                    >
                                        {subjects && subjects.length > 0 ? (
                                            subjects.map((subject) => (
                                                <MenuItem key={subject._id} value={subject._id}>
                                                    {subject.subName}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled>No subjects available</MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                            </Grid>                            <Grid item xs={12} sm={6}>                                <TextField
                                    name="dueDate"
                                    label="Due Date"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={handleInputChange}
                                    fullWidth
                                    required
                                    variant="outlined"
                                    sx={{ 
                                        mb: 1,
                                        "& .MuiInputBase-root": {
                                            overflow: "visible"
                                        }
                                    }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    name="maxMarks"
                                    label="Maximum Marks"
                                    type="number"
                                    value={formData.maxMarks}
                                    onChange={handleInputChange}
                                    fullWidth
                                    required
                                    variant="outlined"
                                    sx={{ mb: 1 }}
                                    InputProps={{ 
                                        inputProps: { min: 1 },
                                    }}
                                />
                            </Grid>                            <Grid item xs={12} sx={{ mt: 2 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    size="large"
                                    disabled={submitting}
                                    sx={{ 
                                        py: 1.5,
                                        mt: 2, 
                                        fontWeight: 600 
                                    }}
                                >
                                    {submitting ? <CircularProgress size={24} /> : 'Create Assignment'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Button 
                        onClick={handleClosePopup} 
                        color="primary"
                        variant="outlined"
                        sx={{ px: 3 }}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirmation Dialog */}
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
                    <Button
                        onClick={confirmDialog.onConfirm}
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notification Snackbar */}
            <Snackbar
                open={notification.show}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.type}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminAssignments;
