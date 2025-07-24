import { useEffect } from 'react';
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
    Alert,
    Button,
} from '@mui/material';
import { CalendarMonth, School, Class, Refresh } from '@mui/icons-material';
import { getClassEvents } from '../../redux/eventRelated/eventHandle';
import { diagnoseSclassEvents } from '../../utils/eventDiagnostics';

const StudentEvents = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { events, loading, error } = useSelector((state) => state.event);

    useEffect(() => {
        if (currentUser?.school && currentUser?.sclassName?._id) {
            console.log("Fetching events for student with school:", currentUser.school, "class:", currentUser.sclassName._id);
            dispatch(getClassEvents(currentUser.school, currentUser.sclassName._id));
        } else if (currentUser?.school && currentUser?.sclassName && typeof currentUser.sclassName === 'string') {
            // Handle case where sclassName is a string ID instead of an object
            console.log("Fetching events with string class ID:", currentUser.school, currentUser.sclassName);
            dispatch(getClassEvents(currentUser.school, currentUser.sclassName));
        } else {
            console.error("Cannot fetch events - missing school or class ID", {
                school: currentUser?.school,
                sclassName: currentUser?.sclassName
            });
        }
    }, [dispatch, currentUser]);

    // Log events for debugging
    useEffect(() => {
        console.log("Student events:", events);
    }, [events]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getEventTypeColor = (type) => {
        switch (type) {
            case 'Holiday':
                return '#4caf50'; // green
            case 'Exam':
                return '#f44336'; // red
            case 'Meeting':
                return '#2196f3'; // blue
            case 'Activity':
                return '#ff9800'; // orange
            default:
                return '#9e9e9e'; // grey
        }
    };

    const groupEventsByMonth = () => {
        const grouped = {};
        if (Array.isArray(events) && events.length > 0) {
            events.forEach(event => {
                const date = new Date(event.startDate);
                const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                
                if (!grouped[monthYear]) {
                    grouped[monthYear] = [];
                }
                
                grouped[monthYear].push(event);
            });
        }
        return grouped;
    };

    const groupedEvents = groupEventsByMonth();

    return (
        <Box sx={{ p: 2 }}>
            <Grid container justifyContent="space-between" alignItems="center" mb={3}>
                <Grid item>
                    <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarMonth sx={{ mr: 1 }} />
                        Class Calendar & Events
                    </Typography>
                </Grid>
                <Grid item>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<Refresh />}
                        onClick={() => {
                            console.log("Refreshing events");
                            if (currentUser?.school && currentUser?.sclassName?._id) {
                                dispatch(getClassEvents(currentUser.school, currentUser.sclassName._id));
                            } else if (currentUser?.school && currentUser?.sclassName && typeof currentUser.sclassName === 'string') {
                                dispatch(getClassEvents(currentUser.school, currentUser.sclassName));
                            }
                            // Run diagnostics (will log to console)
                            diagnoseSclassEvents(currentUser);
                        }}
                    >
                        Refresh Events
                    </Button>
                </Grid>
            </Grid>
            
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error loading events: {error}
                </Alert>
            )}

            {loading ? (
                <Typography>Loading events...</Typography>
            ) : events && events.message ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6">{events.message}</Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                        No events have been scheduled for your class yet.
                    </Typography>
                </Paper>
            ) : (
                Object.keys(groupedEvents).length > 0 ? (
                    Object.entries(groupedEvents).map(([monthYear, monthEvents]) => (
                        <Box key={monthYear} sx={{ mb: 4 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', borderBottom: '2px solid #2196f3', pb: 1 }}>
                                {monthYear}
                            </Typography>
                            <Grid container spacing={2}>
                                {monthEvents.map((event) => (
                                    <Grid item xs={12} md={6} key={event._id}>
                                        <Card 
                                            elevation={3} 
                                            sx={{ 
                                                height: '100%',
                                                borderLeft: `5px solid ${getEventTypeColor(event.eventType)}`,
                                                transition: 'transform 0.2s',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                                }
                                            }}
                                        >
                                            <CardHeader 
                                                title={event.title}
                                                subheader={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                        <Chip 
                                                            label={event.eventType} 
                                                            size="small" 
                                                            sx={{ 
                                                                backgroundColor: getEventTypeColor(event.eventType),
                                                                color: 'white'
                                                            }} 
                                                        />
                                                    </Box>
                                                }
                                            />
                                            <Divider />
                                            <CardContent>
                                                <Typography variant="body2" paragraph>
                                                    {event.description || 'No description provided'}
                                                </Typography>
                                                <Grid container spacing={1}>
                                                    <Grid item xs={12}>
                                                        <Typography variant="body2" color="textSecondary">
                                                            <strong>Duration:</strong> {formatDate(event.startDate)}
                                                            {event.startDate !== event.endDate && ` - ${formatDate(event.endDate)}`}
                                                        </Typography>
                                                    </Grid>
                                                    {!event.sclassName && (
                                                        <Grid item xs={12}>
                                                            <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <School fontSize="small" sx={{ mr: 0.5 }} />
                                                                <strong>School-wide event</strong>
                                                            </Typography>
                                                        </Grid>
                                                    )}
                                                    {event.sclassName && (
                                                        <Grid item xs={12}>
                                                            <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <Class fontSize="small" sx={{ mr: 0.5 }} />
                                                                <strong>For:</strong> {typeof event.sclassName === 'object' && event.sclassName.sclassName 
                                                                    ? event.sclassName.sclassName 
                                                                    : 'Your class'}
                                                            </Typography>
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    ))                ) : (
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h6">No events found</Typography>
                        <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                            There are no scheduled events for your class at this time.
                        </Typography>
                    </Paper>
                )
            )}
        </Box>
    );
};

export default StudentEvents;
