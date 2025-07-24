import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Grid,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
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
import { Add, Delete, Edit, CalendarMonth, Refresh } from '@mui/icons-material';
import { getAllEvents, addEvent, updateEventDetails, deleteEvent } from '../../../redux/eventRelated/eventHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import Popup from '../../../components/Popup';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Use this for testing only, switch back to original component after debugging
const theme = createTheme({
    palette: {
        primary: {
            main: '#2196f3',
        },
        secondary: {
            main: '#ff9800',
        },
    },
});

const AdminEventsDebug = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);
    const { sclasses } = useSelector((state) => state.sclass);
    const { events, loading, error } = useSelector((state) => state.event);

    // Debug state
    const [debugInfo, setDebugInfo] = useState({
        apiCalls: [],
        errors: [],
        reduxState: null
    });

    const [openPopup, setOpenPopup] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', subtitle: '' });
    const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
    const [currentEventId, setCurrentEventId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(),
        eventType: 'Meeting',
        sclassName: '',
        school: currentUser?.school || currentUser?._id,
        createdBy: currentUser?.name
    });

    // Add debug info
    const addDebugInfo = (type, info) => {
        setDebugInfo(prev => ({
            ...prev,
            [type]: [...prev[type], {
                timestamp: new Date().toISOString(),
                info
            }]
        }));
    };

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        const schoolId = currentUser?.school || currentUser?._id;
        if (!schoolId) {
            console.error("No school ID available in user data");
            addDebugInfo('errors', { message: "No school ID available in user data", userData: currentUser });
            return;
        }

        addDebugInfo('apiCalls', { message: "Fetching events", schoolId });
        
        // Log current API URL
        addDebugInfo('apiCalls', { 
            message: "API URLs", 
            eventsUrl: `api/Events/${schoolId}`,
            sclassUrl: `api/SclassList/${schoolId}`
        });

        dispatch(getAllEvents(schoolId))
            .then(result => {
                addDebugInfo('apiCalls', { message: "Events API response", result });
            })
            .catch(error => {
                addDebugInfo('errors', { message: "Error fetching events", error });
            });

        dispatch(getAllSclasses(schoolId, "Sclass"))
            .then(result => {
                addDebugInfo('apiCalls', { message: "Classes API response", result });
            })
            .catch(error => {
                addDebugInfo('errors', { message: "Error fetching classes", error });
            });

    }, [dispatch, currentUser, navigate]);

    // Update debug state whenever Redux state changes
    useEffect(() => {
        setDebugInfo(prev => ({
            ...prev,
            reduxState: { events, sclasses, currentUser }
        }));
    }, [events, sclasses, currentUser]);

    const resetFormData = () => {
        setFormData({
            title: '',
            description: '',
            startDate: new Date(),
            endDate: new Date(),
            eventType: 'Meeting',
            sclassName: '',
            school: currentUser?.school || currentUser?._id,
            createdBy: currentUser?.name
        });
        setFormMode('add');
        setCurrentEventId(null);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleDateChange = (name, newDate) => {
        setFormData({ ...formData, [name]: newDate });
        addDebugInfo('apiCalls', { message: "Date changed", field: name, value: newDate });
    };

    const handleAddEvent = () => {
        resetFormData();
        setOpenPopup(true);
    };

    const handleEditEvent = (eventId) => {
        if (!events) {
            console.error("Events array is undefined");
            addDebugInfo('errors', { message: "Events array is undefined" });
            return;
        }
        
        const eventToEdit = events.find(event => event._id === eventId);
        if (eventToEdit) {
            addDebugInfo('apiCalls', { message: "Editing event", eventToEdit });
            
            try {
                const startDate = eventToEdit.startDate ? new Date(eventToEdit.startDate) : new Date();
                const endDate = eventToEdit.endDate ? new Date(eventToEdit.endDate) : new Date();
                
                setFormData({
                    title: eventToEdit.title || '',
                    description: eventToEdit.description || '',
                    startDate: startDate,
                    endDate: endDate,
                    eventType: eventToEdit.eventType || 'Meeting',
                    sclassName: eventToEdit.sclassName?._id || '',
                    school: eventToEdit.school || currentUser?.school || currentUser?._id,
                    createdBy: eventToEdit.createdBy || currentUser?.name || ''
                });
                setFormMode('edit');
                setCurrentEventId(eventId);
                setOpenPopup(true);
            } catch (error) {
                addDebugInfo('errors', { message: "Error preparing edit form", error });
            }
        } else {
            addDebugInfo('errors', { message: "Event not found with ID", eventId });
            console.error("Event not found with ID:", eventId);
        }
    };

    const handleDeleteEvent = (eventId) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Are you sure you want to delete this event?',
            subtitle: "You can't undo this operation",
            onConfirm: async () => {
                try {
                    addDebugInfo('apiCalls', { message: "Deleting event", eventId });
                    const result = await dispatch(deleteEvent(eventId));
                    setConfirmDialog({ ...confirmDialog, isOpen: false });
                    addDebugInfo('apiCalls', { message: "Delete event result", result });
                    
                    if (result && !result.success) {
                        addDebugInfo('errors', { message: "Delete failed", error: result.error });
                        alert(`Error: ${result.error || 'Unknown error occurred'}`);
                    } else {
                        // Refresh the events list
                        const schoolId = currentUser?.school || currentUser?._id;
                        dispatch(getAllEvents(schoolId));
                    }
                } catch (error) {
                    addDebugInfo('errors', { message: "Exception in delete", error });
                    console.error("Error deleting event:", error);
                    alert("An error occurred while deleting the event. Please try again.");
                    setConfirmDialog({ ...confirmDialog, isOpen: false });
                }
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate dates
        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            alert("End date cannot be before start date");
            return;
        }
        
        try {
            let result;
            if (formMode === 'add') {
                addDebugInfo('apiCalls', { message: "Adding event", formData });
                result = await dispatch(addEvent(formData));
            } else if (formMode === 'edit' && currentEventId) {
                addDebugInfo('apiCalls', { message: "Updating event", id: currentEventId, formData });
                result = await dispatch(updateEventDetails(currentEventId, formData));
            }
            
            addDebugInfo('apiCalls', { message: "Submit result", result });
            
            if (result && result.success) {
                setOpenPopup(false);
                resetFormData();
                // Refresh the events list
                const schoolId = currentUser?.school || currentUser?._id;
                dispatch(getAllEvents(schoolId));
            } else if (result && !result.success) {
                addDebugInfo('errors', { message: "Submit failed", error: result.error });
                alert(`Error: ${result.error || 'Unknown error occurred'}`);
            }
        } catch (error) {
            addDebugInfo('errors', { message: "Exception in submit", error });
            console.error("Error submitting event:", error);
            alert("An error occurred while saving the event. Please try again.");
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Invalid date';
            }
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.error("Error formatting date:", error);
            return 'Invalid date';
        }
    };

    const handleRefresh = () => {
        const schoolId = currentUser?.school || currentUser?._id;
        if (schoolId) {
            addDebugInfo('apiCalls', { message: "Manual refresh", schoolId });
            dispatch(getAllEvents(schoolId));
            dispatch(getAllSclasses(schoolId, "Sclass"));
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ mt: 2, p: 2 }}>
                <Grid container justifyContent="space-between" alignItems="center" mb={3}>
                    <Grid item>
                        <Typography variant="h5" component="h1" gutterBottom>
                            <CalendarMonth sx={{ mr: 1, verticalAlign: 'middle' }} />
                            School Calendar & Events (Debug Mode)
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<Refresh />}
                            onClick={handleRefresh}
                            sx={{ mr: 2 }}
                        >
                            Refresh Data
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Add />}
                            onClick={handleAddEvent}
                        >
                            Add New Event
                        </Button>
                    </Grid>
                </Grid>

                {/* Debug Info Panel */}
                <Paper elevation={3} sx={{ p: 2, mb: 3, maxHeight: '300px', overflow: 'auto' }}>
                    <Typography variant="h6" gutterBottom>Debug Information</Typography>
                    
                    <Typography variant="subtitle1">User Info</Typography>
                    <pre>{JSON.stringify({ 
                        id: currentUser?._id,
                        school: currentUser?.school,
                        name: currentUser?.name
                    }, null, 2)}</pre>
                    
                    <Typography variant="subtitle1">Redux State</Typography>
                    <Typography variant="body2">Events: {events ? events.length : 'undefined'}</Typography>
                    <Typography variant="body2">Classes: {sclasses ? sclasses.length : 'undefined'}</Typography>
                    <Typography variant="body2">Loading: {loading ? 'true' : 'false'}</Typography>
                    <Typography variant="body2">Error: {error ? JSON.stringify(error) : 'null'}</Typography>
                    
                    <Typography variant="subtitle1" mt={2}>API Calls Log</Typography>
                    <Box sx={{ maxHeight: '100px', overflow: 'auto', bgcolor: '#f5f5f5', p: 1 }}>
                        {debugInfo.apiCalls.map((call, index) => (
                            <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                                [{call.timestamp}] {JSON.stringify(call.info)}
                            </Typography>
                        ))}
                    </Box>
                    
                    <Typography variant="subtitle1" mt={2}>Errors Log</Typography>
                    <Box sx={{ maxHeight: '100px', overflow: 'auto', bgcolor: '#fff0f0', p: 1 }}>
                        {debugInfo.errors.map((err, index) => (
                            <Typography key={index} variant="body2" sx={{ mb: 0.5, color: 'error.main' }}>
                                [{err.timestamp}] {JSON.stringify(err.info)}
                            </Typography>
                        ))}
                    </Box>
                </Paper>

                <TableContainer component={Paper} elevation={3}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell>ID</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Start Date</TableCell>
                                <TableCell>End Date</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Class</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        Loading events...
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        Error loading events: {JSON.stringify(error)}
                                    </TableCell>
                                </TableRow>
                            ) : events && events.length > 0 ? (
                                events.map((event) => (
                                    <TableRow key={event._id}>
                                        <TableCell>{event._id}</TableCell>
                                        <TableCell>{event.title}</TableCell>
                                        <TableCell>{event.description?.length > 50
                                            ? `${event.description.substring(0, 50)}...`
                                            : event.description}</TableCell>
                                        <TableCell>{formatDate(event.startDate)}</TableCell>
                                        <TableCell>{formatDate(event.endDate)}</TableCell>
                                        <TableCell>{event.eventType}</TableCell>
                                        <TableCell>{event.sclassName?.sclassName || 'All Classes'}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleEditEvent(event._id)}
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteEvent(event._id)}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        No events found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Popup
                    title={formMode === 'add' ? "Add New Event" : "Edit Event"}
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
                                <TextField
                                    name="startDate"
                                    label="Start Date"
                                    type="date"
                                    value={formData.startDate instanceof Date 
                                        ? formData.startDate.toISOString().split('T')[0]
                                        : new Date(formData.startDate).toISOString().split('T')[0]}
                                    onChange={(e) => handleDateChange('startDate', new Date(e.target.value))}
                                    fullWidth
                                    required
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    name="endDate"
                                    label="End Date"
                                    type="date"
                                    value={formData.endDate instanceof Date 
                                        ? formData.endDate.toISOString().split('T')[0] 
                                        : new Date(formData.endDate).toISOString().split('T')[0]}
                                    onChange={(e) => handleDateChange('endDate', new Date(e.target.value))}
                                    fullWidth
                                    required
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Event Type</InputLabel>
                                    <Select
                                        name="eventType"
                                        value={formData.eventType}
                                        onChange={handleFormChange}
                                    >
                                        <MenuItem value="Holiday">Holiday</MenuItem>
                                        <MenuItem value="Exam">Exam</MenuItem>
                                        <MenuItem value="Meeting">Meeting</MenuItem>
                                        <MenuItem value="Activity">Activity</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Class (Optional)</InputLabel>
                                    <Select
                                        name="sclassName"
                                        value={formData.sclassName}
                                        onChange={handleFormChange}
                                    >
                                        <MenuItem value="">All Classes</MenuItem>
                                        {sclasses && sclasses.length > 0 ? (
                                            sclasses.map((sclass) => (
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
                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                >
                                    {formMode === 'add' ? 'Add Event' : 'Update Event'}
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
        </ThemeProvider>
    );
};

export default AdminEventsDebug;
