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
    Paper,
    Chip,
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
} from '@mui/material';
import { Add, Delete, Edit, Folder, Link, InsertDriveFile, PlayCircle, Image, Description } from '@mui/icons-material';
import { getAllResources, getClassResources, getSubjectResources, addResource, deleteResource } from '../../redux/resourceRelated/resourceHandle';
import { getSubjectsByClass } from '../../redux/subjectRelated/subjectHandle';
import Popup from '../../components/Popup';

const TeacherResources = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { resources, loading, error } = useSelector((state) => state.resource);
    const { subjects } = useSelector((state) => state.subject);
    const [activeFilter, setActiveFilter] = useState('all');

    const [openPopup, setOpenPopup] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', subtitle: '' });
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        resourceType: 'Document',
        fileUrl: '',
        school: currentUser?.school,
        sclassName: currentUser?.teachSclass?._id || '',
        subject: currentUser?.teachSubject?._id || '',
        uploadedBy: currentUser?._id,
        uploaderModel: 'teacher'
    });    useEffect(() => {
        if (currentUser?.school && currentUser?.teachSclass?._id) {
            console.log("Fetching resources for teacher with school:", currentUser.school, "class:", currentUser.teachSclass._id);
            dispatch(getClassResources(currentUser.school, currentUser.teachSclass._id));
            dispatch(getSubjectsByClass(currentUser.teachSclass._id));
        }
    }, [dispatch, currentUser]);

    // Log resources for debugging
    useEffect(() => {
        console.log("Teacher resources:", resources);
    }, [resources]);

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
    };

    const resetFormData = () => {
        setFormData({
            title: '',
            description: '',
            resourceType: 'Document',
            fileUrl: '',
            school: currentUser?.school,
            sclassName: currentUser?.teachSclass?._id || '',
            subject: currentUser?.teachSubject?._id || '',
            uploadedBy: currentUser?._id,
            uploaderModel: 'teacher'
        });
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
            onConfirm: () => {
                dispatch(deleteResource(resourceId));
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            }
        });
    };    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Make sure school and uploader IDs are set
        const dataToSubmit = {
            ...formData,
            school: currentUser?.school,
            uploadedBy: currentUser?._id,
            sclassName: currentUser?.teachSclass?._id || ''
        };
        
        console.log("Submitting resource data:", dataToSubmit);
        const result = await dispatch(addResource(dataToSubmit));
        
        if (result.success) {
            console.log("Resource added successfully:", result.data);
            // Refresh the resources list
            if (currentUser?.school && currentUser?.teachSclass?._id) {
                dispatch(getClassResources(currentUser.school, currentUser.teachSclass._id));
            }
        } else {
            console.error("Failed to add resource:", result.error);
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
    };    const filteredResources = Array.isArray(resources) && resources.length > 0
        ? activeFilter === 'all'
            ? resources
            : resources.filter(resource => resource.resourceType === activeFilter)
        : [];

    return (
        <Box sx={{ p: 2 }}>
            <Grid container justifyContent="space-between" alignItems="center" mb={3}>
                <Grid item>
                    <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Folder sx={{ mr: 1 }} />
                        Class Learning Resources
                    </Typography>
                </Grid>
                <Grid item>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        onClick={handleAddResource}
                    >
                        Add Resource
                    </Button>
                </Grid>
            </Grid>

            <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button 
                    variant={activeFilter === 'all' ? 'contained' : 'outlined'}
                    onClick={() => handleFilterChange('all')}
                >
                    All
                </Button>
                <Button 
                    variant={activeFilter === 'Document' ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={() => handleFilterChange('Document')}
                >
                    Documents
                </Button>
                <Button 
                    variant={activeFilter === 'Video' ? 'contained' : 'outlined'}
                    color="error"
                    onClick={() => handleFilterChange('Video')}
                >
                    Videos
                </Button>
                <Button 
                    variant={activeFilter === 'Link' ? 'contained' : 'outlined'}
                    color="success"
                    onClick={() => handleFilterChange('Link')}
                >
                    Links
                </Button>
                <Button 
                    variant={activeFilter === 'Image' ? 'contained' : 'outlined'}
                    color="warning"
                    onClick={() => handleFilterChange('Image')}
                >
                    Images
                </Button>
            </Box>

            {loading ? (
                <Typography>Loading resources...</Typography>
            ) : resources && resources.message ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6">{resources.message}</Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                        No learning resources have been added for your class yet. Start adding resources using the button above.
                    </Typography>
                </Paper>
            ) : filteredResources.length > 0 ? (
                <Grid container spacing={3}>
                    {filteredResources.map((resource) => (
                        <Grid item xs={12} sm={6} md={4} key={resource._id}>
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
                            >                                <CardHeader
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
                                    {resource.subject && resource.subject.subName && (
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Subject:</strong> {resource.subject.subName}
                                        </Typography>
                                    )}
                                </CardContent>
                                <Divider />
                                <CardActions sx={{ justifyContent: 'space-between', p: 1.5 }}>                                    <Button 
                                        size="small" 
                                        variant="contained"
                                        href={typeof resource.fileUrl === 'string' ? resource.fileUrl : '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        disabled={!resource.fileUrl || typeof resource.fileUrl !== 'string'}
                                        sx={{
                                            backgroundColor: getResourceTypeColor(resource.resourceType),
                                            '&:hover': {
                                                backgroundColor: getResourceTypeColor(resource.resourceType),
                                                opacity: 0.9
                                            }
                                        }}
                                    >
                                        Open Resource
                                    </Button>
                                    {resource.uploadedBy && resource.uploadedBy.toString() === currentUser._id && (
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeleteResource(resource._id)}
                                        >
                                            <Delete />
                                        </IconButton>
                                    )}
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6">No resources found</Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                        No resources match your selected filter or no resources have been added yet.
                    </Typography>
                </Paper>
            )}

            <Popup
                title="Add New Learning Resource"
                openPopup={openPopup}
                setOpenPopup={setOpenPopup}
            >
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
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Subject</InputLabel>
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
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TeacherResources;
