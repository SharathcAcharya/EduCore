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
    CircularProgress
} from '@mui/material';
import { Add, Refresh, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAllEvents } from '../../../redux/eventRelated/eventHandle';
import { isValidObjectId, formatEventDate } from '../../../utils/eventUtils';
import FormDialog from '../../../components/FormDialog';
import EventForm from '../../../components/events/EventForm';
import { useEventForm } from '../../../hooks/useEventForm';

const EventsDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);
    const { events, loading, error } = useSelector((state) => state.event);
    const { sclasses } = useSelector((state) => state.sclass);
    
    const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });    // Use our custom hook for event form handling
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
        handleAddEvent,
        handleEditEvent 
    } = useEventForm(currentUser);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        
        // Get the school ID from current user
        const schoolId = currentUser?.school || currentUser?._id;
        
        // Validate the school ID
        if (!schoolId || !isValidObjectId(schoolId)) {
            setStatusMessage({
                type: 'error',
                message: 'Invalid school ID. Please contact your administrator.'
            });
            return;
        }
        
        // Fetch events for the school
        console.log("Fetching events for school ID:", schoolId);
        dispatch(getAllEvents(schoolId));
    }, [dispatch, currentUser, navigate]);
    
    const handleRefresh = () => {
        const schoolId = currentUser?.school || currentUser?._id;
        if (!schoolId || !isValidObjectId(schoolId)) {
            setStatusMessage({
                type: 'error',
                message: 'Invalid school ID. Please contact your administrator.'
            });
            return;
        }
        
        setStatusMessage({ type: 'info', message: 'Refreshing events...' });
        dispatch(getAllEvents(schoolId))
            .then(result => {
                if (result && result.success) {
                    setStatusMessage({ type: 'success', message: 'Events refreshed successfully!' });
                    setTimeout(() => setStatusMessage({ type: '', message: '' }), 3000);
                } else {
                    setStatusMessage({ 
                        type: 'error', 
                        message: result?.error || 'Error refreshing events. Please try again.' 
                    });
                }
            })
            .catch(err => {
                setStatusMessage({ 
                    type: 'error', 
                    message: 'Error refreshing events: ' + (err.message || 'Unknown error') 
                });
            });
    };
    
    const getEventTypeColor = (type) => {
        const colors = {
            'Holiday': '#4caf50',  // Green
            'Exam': '#f44336',     // Red
            'Meeting': '#2196f3',  // Blue
            'Activity': '#9c27b0', // Purple
            'Other': '#ff9800'     // Orange
        };
        return colors[type] || colors.Other;
    };    
    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h4" component="h1">
                            Events Dashboard
                        </Typography>
                        <Box>                            <Button 
                                variant="outlined" 
                                color="secondary" 
                                startIcon={<ArrowBack />}
                                onClick={() => navigate('/Admin/events')}
                                sx={{ mr: 2 }}
                            >
                                Back to Events List
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
                                onClick={handleAddEvent}
                            >
                                Add New Event
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
                            Events Overview
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            This dashboard allows you to manage school events. You can create, edit, and view events for your school.
                        </Typography>
                        
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : error ? (
                            <Alert severity="error" sx={{ my: 2 }}>
                                Error loading events: {error}
                            </Alert>
                        ) : events && events.length > 0 ? (
                            <Grid container spacing={3} sx={{ mt: 2 }}>
                                {events.map(event => (
                                    <Grid item xs={12} sm={6} md={4} key={event._id}>
                                        <Card sx={{ 
                                            height: '100%', 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            borderTop: `4px solid ${getEventTypeColor(event.eventType)}`
                                        }}>
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography variant="h6" component="h2" gutterBottom>
                                                    {event.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" paragraph>
                                                    {event.description}
                                                </Typography>
                                                <Typography variant="body2">
                                                    <strong>Start:</strong> {formatEventDate(event.startDate)}
                                                </Typography>
                                                <Typography variant="body2">
                                                    <strong>End:</strong> {formatEventDate(event.endDate)}
                                                </Typography>
                                                <Typography variant="body2">
                                                    <strong>Type:</strong> {event.eventType}
                                                </Typography>
                                                <Typography variant="body2">
                                                    <strong>Class:</strong> {event.sclassName?.sclassName || 'All Classes'}
                                                </Typography>
                                            </CardContent>
                                            <CardActions>
                                                <Button 
                                                    size="small" 
                                                    onClick={() => handleEditEvent(event._id, events)}
                                                >
                                                    Edit
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Alert severity="info" sx={{ my: 2 }}>
                                No events found. Click "Add New Event" to create one.
                            </Alert>
                        )}
                    </Paper>
                </Grid>
            </Grid>
            
            <FormDialog
                title={formMode === 'add' ? "Add New Event" : "Edit Event"}
                openPopup={openPopup}
                setOpenPopup={setOpenPopup}
            >                <EventForm
                    formData={formData}
                    handleFormChange={handleFormChange}
                    handleSubmit={handleSubmit}
                    sclasses={sclasses || []}
                    formMode={formMode}
                    isSubmitting={isSubmitting}
                    submitError={submitError}
                    submitSuccess={submitSuccess}
                />
            </FormDialog>
        </Box>
    );
};

export default EventsDashboard;
