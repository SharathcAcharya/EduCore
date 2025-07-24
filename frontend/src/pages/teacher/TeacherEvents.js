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
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
} from '@mui/material';
import { CalendarMonth, Add, School, Class, Refresh } from '@mui/icons-material';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';
import { getAllEvents, getClassEvents, addEvent } from '../../redux/eventRelated/eventHandle';
import Popup from '../../components/Popup';
import { diagnoseSclassEvents } from '../../utils/eventDiagnostics';

const TeacherEvents = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { events, loading, error } = useSelector((state) => state.event);
    
    const [openPopup, setOpenPopup] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(),
        eventType: 'Activity',
        sclassName: currentUser?.teachSclass?._id || '',
        school: currentUser?.school,
        createdBy: currentUser?.name
    });    useEffect(() => {
        if (currentUser?.school && currentUser?.teachSclass?._id) {
            console.log("Fetching events for teacher with school:", currentUser.school, "class:", currentUser.teachSclass._id);
            dispatch(getClassEvents(currentUser.school, currentUser.teachSclass._id));
        } else if (currentUser?.school && currentUser?.teachSclass && typeof currentUser.teachSclass === 'string') {
            // Handle case where teachSclass is a string ID instead of an object
            console.log("Fetching events with string class ID:", currentUser.school, currentUser.teachSclass);
            dispatch(getClassEvents(currentUser.school, currentUser.teachSclass));
        } else if (currentUser?.school) {
            // Fallback to all school events if no class is found
            console.log("Fetching all school events:", currentUser.school);
            dispatch(getAllEvents(currentUser.school));
        } else {
            console.error("Cannot fetch events - missing school ID", {
                school: currentUser?.school,
                teachSclass: currentUser?.teachSclass
            });
        }
    }, [dispatch, currentUser]);

    // Log events for debugging
    useEffect(() => {
        console.log("Teacher events:", events);
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

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleDateChange = (name, newDate) => {
        // Ensure we have a valid date
        if (newDate && !isNaN(new Date(newDate).getTime())) {
            setFormData({ ...formData, [name]: newDate });
        } else {
            console.error("Invalid date format:", newDate);
            // Set to current date as fallback
            setFormData({ ...formData, [name]: new Date() });
        }
    };

    const handleAddEvent = () => {
        setOpenPopup(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await dispatch(addEvent(formData));
        setOpenPopup(false);
        resetFormData();
        
        // Refresh the events list
        if (currentUser?.school && currentUser?.teachSclass?._id) {
            dispatch(getClassEvents(currentUser.school, currentUser.teachSclass._id));
        }
    };

    const resetFormData = () => {
        setFormData({
            title: '',
            description: '',
            startDate: new Date(),
            endDate: new Date(),
            eventType: 'Activity',
            sclassName: currentUser?.teachSclass?._id || '',
            school: currentUser?.school,
            createdBy: currentUser?.name
        });
    };    const groupEventsByMonth = () => {
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
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        onClick={handleAddEvent}
                        sx={{ mr: 1 }}
                    >
                        Add Class Event
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={() => {
                            console.log("Refreshing events");
                            if (currentUser?.school && currentUser?.teachSclass?._id) {
                                dispatch(getClassEvents(currentUser.school, currentUser.teachSclass._id));
                            } else if (currentUser?.school && currentUser?.teachSclass && typeof currentUser.teachSclass === 'string') {
                                dispatch(getClassEvents(currentUser.school, currentUser.teachSclass));
                            } else if (currentUser?.school) {
                                dispatch(getAllEvents(currentUser.school));
                            }
                            // Run diagnostics (will log to console)
                            diagnoseSclassEvents(currentUser);
                        }}
                    >
                        Refresh
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
                        No events have been scheduled for your class yet. You can add a new event using the button above.
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
                                                        {event.createdBy && (
                                                            <Typography variant="caption" sx={{ ml: 1 }}>
                                                                Added by: {event.createdBy}
                                                            </Typography>
                                                        )}
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
                            There are no scheduled events for your class at this time. You can add a new event using the button above.
                        </Typography>
                    </Paper>
                )
            )}

            <Popup
                title="Add New Class Event"
                openPopup={openPopup}
                setOpenPopup={setOpenPopup}
            >
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                name="title"
                                label="Event Title"
                                value={formData.title}
                                onChange={handleFormChange}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="description"
                                label="Event Description"
                                value={formData.description}
                                onChange={handleFormChange}
                                fullWidth
                                multiline
                                rows={4}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Start Date"
                                    value={formData.startDate}
                                    onChange={(newDate) => handleDateChange('startDate', newDate)}
                                    renderInput={(params) => <TextField {...params} fullWidth required />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="End Date"
                                    value={formData.endDate}
                                    onChange={(newDate) => handleDateChange('endDate', newDate)}
                                    renderInput={(params) => <TextField {...params} fullWidth required />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Event Type</InputLabel>
                                <Select
                                    name="eventType"
                                    value={formData.eventType}
                                    onChange={handleFormChange}
                                >
                                    <MenuItem value="Activity">Activity</MenuItem>
                                    <MenuItem value="Exam">Exam</MenuItem>
                                    <MenuItem value="Meeting">Meeting</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
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
                                Add Event
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Popup>
        </Box>
    );
};

export default TeacherEvents;
