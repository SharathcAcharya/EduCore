import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Divider,
    Button,
    IconButton,
} from '@mui/material';
import { Folder, InsertDriveFile, Link, PlayCircle, Image, Description } from '@mui/icons-material';
import { getClassResources, getSubjectResources } from '../../redux/resourceRelated/resourceHandle';

const StudentResources = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { resources, loading, error } = useSelector((state) => state.resource);
    const [activeFilter, setActiveFilter] = useState('all');    useEffect(() => {
        if (currentUser?.school && currentUser?.sclassName?._id) {
            console.log("Fetching resources for student with school:", currentUser.school, "class:", currentUser.sclassName._id);
            dispatch(getClassResources(currentUser.school, currentUser.sclassName._id));
        }
    }, [dispatch, currentUser]);

    // Log resources for debugging
    useEffect(() => {
        console.log("Student resources:", resources);
    }, [resources]);

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
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
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Folder sx={{ mr: 1 }} />
                Learning Resources
            </Typography>

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
                        No learning resources have been added for your class yet.
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
                                <Divider />                                <Box sx={{ p: 1.5, textAlign: 'center' }}>
                                    <Button 
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
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6">No resources found</Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                        No resources match your selected filter.
                    </Typography>
                </Paper>
            )}
        </Box>
    );
};

export default StudentResources;
