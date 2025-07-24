import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Grid,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Chip,
    Paper,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import { Add, Delete, Folder, Link, InsertDriveFile, PlayCircle, Image, Description } from '@mui/icons-material';
import { getAllResources, addResource, deleteResource } from '../../../redux/resourceRelated/resourceHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { getAllSubjects } from '../../../redux/subjectRelated/subjectHandle';

const AdminResources = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { resources = [], loading, error } = useSelector((state) => state.resource || {});
    const { sclasses = [] } = useSelector((state) => state.sclass || {});
    const { subjects = [] } = useSelector((state) => state.subject || {});

    const [openPopup, setOpenPopup] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', subtitle: '' });
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        resourceType: 'Document',
        fileUrl: '',
        school: currentUser?.school || currentUser?._id,
        sclassName: '',
        subject: '',
        uploadedBy: currentUser?._id,
        uploaderModel: 'admin'
    });
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    
    useEffect(() => {
        // For Admin users, if school is not set, use their _id as the school identifier
        const schoolId = currentUser?.school || currentUser?._id;
        
        if (!schoolId) {
            console.log('School ID not found');
            return;
        }
          
        console.log("Admin fetching resources with school ID:", schoolId);
        
        // Fetch resources and handle potential failures
        const fetchResources = async () => {
            try {
                await dispatch(getAllResources(schoolId));
                // Also fetch classes and subjects in parallel
                await Promise.all([
                    dispatch(getAllSclasses(schoolId, "Sclass")),
                    dispatch(getAllSubjects(schoolId))
                ]);
            } catch (error) {
                console.error("Error fetching data:", error);
                setNotification({
                    show: true,
                    message: 'Failed to load resources. Please refresh the page.',
                    type: 'error'
                });
            }
        };
        
        fetchResources();
    }, [dispatch, currentUser]);
    
    // Log resources for debugging
    useEffect(() => {
        console.log("Admin resources:", resources);
        
        // Check if resources are loaded correctly
        if (Array.isArray(resources) && resources.length > 0) {
            // Check the first resource for debugging
            const firstResource = resources[0];
            console.log("Sample resource structure:", {
                id: firstResource._id,
                title: firstResource.title,
                description: firstResource.description,
                class: firstResource.sclassName,
                subject: firstResource.subject,
                url: firstResource.fileUrl
            });
        }
    }, [resources]);
    
    const resetFormData = () => {
        setFormData({
            title: '',
            description: '',
            resourceType: 'Document',
            fileUrl: '',
            school: currentUser?.school || currentUser?._id,
            sclassName: '',
            subject: '',
            uploadedBy: currentUser?._id,
            uploaderModel: 'admin'
        });
    };
    
    // Helper function to validate resource data
    const validateResource = (resource) => {
        if (!resource) return false;
        if (!resource._id) {
            console.warn("Resource missing ID:", resource);
            return false;
        }
        if (!resource.title || typeof resource.title !== 'string') {
            console.warn("Resource with invalid title:", resource);
            // Still return true since we can display it with a default title
        }
        return true;
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddResource = () => {
        resetFormData();
        setOpenPopup(true);
    };
    
    const handleDeleteResource = (resourceId) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Are you sure you want to delete this resource?',
            subtitle: "You can't undo this operation",
            onConfirm: async () => {
                const result = await dispatch(deleteResource(resourceId));
                setConfirmDialog({ ...confirmDialog, isOpen: false });
                
                if (result.success) {
                    setNotification({
                        show: true,
                        message: 'Resource deleted successfully!',
                        type: 'success'
                    });
                } else {
                    setNotification({
                        show: true,
                        message: result.error?.message || 'Failed to delete resource',
                        type: 'error'
                    });
                }
                
                // Hide notification after 3 seconds
                setTimeout(() => {
                    setNotification({ show: false, message: '', type: '' });
                }, 3000);
            }
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Make sure school and uploader IDs are set
        const dataToSubmit = {
            ...formData,
            school: currentUser?.school || currentUser?._id,
            uploadedBy: currentUser?._id
        };
        
        console.log("Submitting resource data:", dataToSubmit);
        const result = await dispatch(addResource(dataToSubmit));
        
        if (result.success) {
            console.log("Resource added successfully:", result.data);
            setNotification({
                show: true,
                message: 'Resource added successfully!',
                type: 'success'
            });
            
            // Hide notification after 3 seconds
            setTimeout(() => {
                setNotification({ show: false, message: '', type: '' });
            }, 3000);
            
            // Refresh the resources list
            const schoolId = currentUser?.school || currentUser?._id;
            dispatch(getAllResources(schoolId));
        } else {
            console.error("Failed to add resource:", result.error);
            setNotification({
                show: true,
                message: result.error?.message || 'Failed to add resource',
                type: 'error'
            });
            
            // Hide notification after 3 seconds
            setTimeout(() => {
                setNotification({ show: false, message: '', type: '' });
            }, 3000);
        }
        
        setOpenPopup(false);
        resetFormData();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getResourceTypeIcon = (type) => {
        switch (type) {
            case 'Document':
                return <InsertDriveFile />;
            case 'Video':
                return <PlayCircle />;
            case 'Link':
                return <Link />;
            case 'Image':
                return <Image />;
            default:
                return <Description />;
        }
    };

    const getResourceTypeColor = (type) => {
        switch (type) {
            case 'Document':
                return '#2196f3'; // blue
            case 'Video':
                return '#f44336'; // red
            case 'Link':
                return '#4caf50'; // green
            case 'Image':
                return '#ff9800'; // orange
            default:
                return '#9e9e9e'; // grey
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <Grid container justifyContent="space-between" alignItems="center" mb={3}>
                <Grid item>
                    <Typography variant="h5" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <Folder sx={{ mr: 1 }} />
                        Learning Resources
                    </Typography>
                </Grid>
                <Grid item>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        onClick={handleAddResource}
                    >
                        Add New Resource
                    </Button>
                </Grid>
            </Grid>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', mt: 4 }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                        Loading resources...
                    </Typography>
                </Box>) : error ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" color="error">
                        {typeof error === 'object' && error.message ? error.message : error}
                    </Typography>
                </Paper>
            ) : Array.isArray(resources) && resources.length > 0 ? (
                <Grid container spacing={3}>
                    {resources
                        .filter(resource => validateResource(resource))
                        .map((resource) => (
                        <Grid item xs={12} sm={6} md={4} key={resource._id || `resource-${Math.random()}`}>
                            <Card 
                                elevation={3}
                                sx={{ 
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                    }
                                }}
                            ><CardHeader
                                    avatar={getResourceTypeIcon(resource.resourceType || 'Other')}
                                    title={typeof resource.title === 'string' ? resource.title : 'Untitled Resource'}
                                    subheader={
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <Chip 
                                                label={typeof resource.resourceType === 'string' ? resource.resourceType : 'Other'} 
                                                size="small" 
                                                sx={{ 
                                                    backgroundColor: getResourceTypeColor(resource.resourceType),
                                                    color: 'white'
                                                }} 
                                            />
                                            <Typography variant="caption" sx={{ ml: 1 }}>
                                                {resource.uploadDate ? formatDate(resource.uploadDate) : 'No date'}
                                            </Typography>
                                        </Box>
                                    }
                                />
                                <Divider />                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {typeof resource.description === 'string' ? resource.description : 'No description available'}
                                    </Typography>
                                    
                                    {/* Display class name */}
                                    {resource.sclassName && (
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Class:</strong> {
                                                typeof resource.sclassName === 'object' && resource.sclassName?.sclassName 
                                                    ? resource.sclassName.sclassName 
                                                    : (typeof resource.sclassName === 'string' ? resource.sclassName : 'N/A')
                                            }
                                        </Typography>
                                    )}
                                    
                                    {/* Display subject name */}
                                    {resource.subject && (
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Subject:</strong> {
                                                typeof resource.subject === 'object' && resource.subject?.subName 
                                                    ? resource.subject.subName 
                                                    : (typeof resource.subject === 'string' ? resource.subject : 'N/A')
                                            }
                                        </Typography>
                                    )}
                                </CardContent>
                                <Divider />
                                <CardActions sx={{ justifyContent: 'space-between' }}>                                    <Button 
                                        size="small" 
                                        variant="outlined"
                                        color="primary"
                                        href={typeof resource.fileUrl === 'string' ? resource.fileUrl : '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        disabled={!resource.fileUrl || typeof resource.fileUrl !== 'string'}
                                    >
                                        Open Resource
                                    </Button>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDeleteResource(resource._id)}
                                    >
                                        <Delete />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6">No resources available</Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                        Start adding learning resources for your school.
                    </Typography>
                </Paper>
            )}

            <Dialog 
                open={openPopup}
                onClose={() => setOpenPopup(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Add New Learning Resource</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    name="title"
                                    label="Resource Title"
                                    value={formData.title}
                                    onChange={handleFormChange}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name="description"
                                    label="Resource Description"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Resource Type</InputLabel>
                                    <Select
                                        name="resourceType"
                                        value={formData.resourceType}
                                        onChange={handleFormChange}
                                    >
                                        <MenuItem value="Document">Document</MenuItem>
                                        <MenuItem value="Video">Video</MenuItem>
                                        <MenuItem value="Link">Link</MenuItem>
                                        <MenuItem value="Image">Image</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    name="fileUrl"
                                    label="Resource URL"
                                    value={formData.fileUrl}
                                    onChange={handleFormChange}
                                    fullWidth
                                    required
                                    helperText="Provide a link to the resource (Google Drive, YouTube, etc.)"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Class (Optional)</InputLabel>
                                    <Select
                                        name="sclassName"
                                        value={formData.sclassName}
                                        onChange={handleFormChange}
                                    >
                                        <MenuItem value="">Not Specific to Any Class</MenuItem>
                                        {sclasses.map((sclass) => (
                                            <MenuItem key={sclass._id} value={sclass._id}>
                                                {sclass.sclassName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Subject (Optional)</InputLabel>
                                    <Select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleFormChange}
                                    >
                                        <MenuItem value="">Not Specific to Any Subject</MenuItem>
                                        {subjects.map((subject) => (
                                            <MenuItem key={subject._id} value={subject._id}>
                                                {subject.subName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                >
                                    Add Resource
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </DialogContent>
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
                    <Button onClick={confirmDialog.onConfirm} color="error">
                        Delete
                    </Button>            </DialogActions>
            </Dialog>

            {/* Notification Snackbar */}
            <Snackbar 
                open={notification.show} 
                autoHideDuration={3000} 
                onClose={() => setNotification({ ...notification, show: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setNotification({ ...notification, show: false })} 
                    severity={notification.type === 'success' ? 'success' : 'error'} 
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminResources;
