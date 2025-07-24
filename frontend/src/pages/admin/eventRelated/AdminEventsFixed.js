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
    Chip,
    Tooltip,
    TableSortLabel,
    TablePagination,
    InputAdornment,
} from '@mui/material';
import { Add, Delete, Edit, CalendarMonth, Refresh, Search, FilterList, Clear } from '@mui/icons-material';
import { getAllEvents, addEvent, updateEventDetails, deleteEvent } from '../../../redux/eventRelated/eventHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import Popup from '../../../components/Popup';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#2196f3',
        },
        secondary: {
            main: '#ff9800',
        },
        eventTypes: {
            Holiday: '#4caf50',  // Green
            Exam: '#f44336',     // Red
            Meeting: '#2196f3',  // Blue
            Activity: '#9c27b0', // Purple
            Other: '#ff9800'     // Orange
        }
    },
});

const AdminEventsFixed = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);
    const { sclasses } = useSelector((state) => state.sclass);
    const { events, loading, error } = useSelector((state) => state.event);

    const [openPopup, setOpenPopup] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', subtitle: '' });
    const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
    const [currentEventId, setCurrentEventId] = useState(null);
    
    // Filtering and Sorting states
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [filterType, setFilterType] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [orderBy, setOrderBy] = useState('startDate');
    const [order, setOrder] = useState('asc');
    
    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

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

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        const schoolId = currentUser?.school || currentUser?._id;
        if (!schoolId) {
            console.error("No school ID available in user data");            
            return;
        }
        console.log("Fetching events for school ID:", schoolId);
        
        // Force a refresh of the events from the server
        dispatch(getAllEvents(schoolId));
        dispatch(getAllSclasses(schoolId, "Sclass"));
    }, [dispatch, currentUser, navigate]);

    // Apply filtering and sorting when events change
    useEffect(() => {
        if (!events) return;
        
        let filtered = [...events];
        
        // Apply type filter
        if (filterType) {
            filtered = filtered.filter(event => event.eventType === filterType);
        }
        
        // Apply class filter
        if (filterClass) {
            filtered = filtered.filter(event => 
                event.sclassName && event.sclassName._id === filterClass
            );
        }
        
        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(event => 
                event.title.toLowerCase().includes(query) || 
                event.description.toLowerCase().includes(query)
            );
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            const aValue = a[orderBy];
            const bValue = b[orderBy];
            
            if (orderBy === 'startDate' || orderBy === 'endDate') {
                const dateA = new Date(aValue);
                const dateB = new Date(bValue);
                
                if (order === 'asc') {
                    return dateA - dateB;
                } else {
                    return dateB - dateA;
                }
            } else {
                const compareA = typeof aValue === 'string' ? aValue.toLowerCase() : aValue;
                const compareB = typeof bValue === 'string' ? bValue.toLowerCase() : bValue;
                
                if (order === 'asc') {
                    return compareA < compareB ? -1 : compareA > compareB ? 1 : 0;
                } else {
                    return compareB < compareA ? -1 : compareB > compareA ? 1 : 0;
                }
            }
        });
        
        setFilteredEvents(filtered);
    }, [events, filterType, filterClass, searchQuery, orderBy, order]);

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
        
        // Special handling for date fields
        if (name === 'startDate' || name === 'endDate') {
            // Create a date object from the input value
            const dateValue = new Date(value);
            setFormData({ ...formData, [name]: dateValue });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleAddEvent = () => {
        resetFormData();
        setOpenPopup(true);
    };    

    const handleEditEvent = (eventId) => {
        if (!events) {
            console.error("Events array is undefined");
            return;
        }
        
        const eventToEdit = events.find(event => event._id === eventId);
        if (eventToEdit) {
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
        } else {
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
                    const result = await dispatch(deleteEvent(eventId));
                    setConfirmDialog({ ...confirmDialog, isOpen: false });
                    
                    if (result && !result.success) {
                        alert(`Error: ${result.error || 'Unknown error occurred'}`);
                    } else {
                        // Refresh the events list
                        const schoolId = currentUser?.school || currentUser?._id;
                        dispatch(getAllEvents(schoolId));
                    }
                } catch (error) {
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
        if (formData.startDate > formData.endDate) {
            alert("End date cannot be before start date");
            return;
        }
        
        try {
            let result;
            if (formMode === 'add') {
                result = await dispatch(addEvent(formData));
            } else if (formMode === 'edit' && currentEventId) {
                result = await dispatch(updateEventDetails(currentEventId, formData));
            }
            
            if (result && result.success) {
                setOpenPopup(false);
                resetFormData();
                // Refresh the events list
                const schoolId = currentUser?.school || currentUser?._id;
                dispatch(getAllEvents(schoolId));
            } else if (result && !result.success) {
                alert(`Error: ${result.error || 'Unknown error occurred'}`);
            }
        } catch (error) {
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

    // New sort handler
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Event type chip color mapping
    const getEventTypeColor = (type) => {
        const colors = {
            'Holiday': theme.palette.eventTypes.Holiday,
            'Exam': theme.palette.eventTypes.Exam,
            'Meeting': theme.palette.eventTypes.Meeting,
            'Activity': theme.palette.eventTypes.Activity,
            'Other': theme.palette.eventTypes.Other
        };
        return colors[type] || colors.Other;
    };

    // Handle page change
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Handle rows per page change
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Clear all filters
    const clearFilters = () => {
        setFilterType('');
        setFilterClass('');
        setSearchQuery('');
        setOrderBy('startDate');
        setOrder('asc');
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ mt: 2, p: 2 }}>
                <Grid container justifyContent="space-between" alignItems="center" mb={3}>
                    <Grid item>
                        <Typography variant="h5" component="h1" gutterBottom>
                            <CalendarMonth sx={{ mr: 1, verticalAlign: 'middle' }} />
                            School Calendar & Events
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<Refresh />}
                            onClick={() => {
                                const schoolId = currentUser?.school || currentUser?._id;
                                if (schoolId) {
                                    dispatch(getAllEvents(schoolId));
                                    dispatch(getAllSclasses(schoolId, "Sclass"));
                                }
                            }}
                            sx={{ mr: 2 }}
                        >                            Refresh
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/Admin/events-dashboard')}
                            sx={{ mr: 2 }}
                        >
                            Open Dashboard View
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Add />}
                            onClick={handleAddEvent}
                            sx={{ ml: 1 }}
                        >
                            Add New Event
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            onClick={() => navigate('/Admin/events-debug')}
                            sx={{ ml: 1 }}
                        >
                            Debug Mode
                        </Button>
                    </Grid>
                </Grid>

                {/* Filtering UI */}
                <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>
                                <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Filter and Search Events
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Grid container spacing={2} justifyContent="flex-end">
                                <Grid item>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        startIcon={<Clear />}
                                        onClick={clearFilters}
                                    >
                                        Clear Filters
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Event Type</InputLabel>
                                        <Select
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value)}
                                        >
                                            <MenuItem value="">All Types</MenuItem>
                                            <MenuItem value="Holiday">Holiday</MenuItem>
                                            <MenuItem value="Exam">Exam</MenuItem>
                                            <MenuItem value="Meeting">Meeting</MenuItem>
                                            <MenuItem value="Activity">Activity</MenuItem>
                                            <MenuItem value="Other">Other</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Class</InputLabel>
                                        <Select
                                            value={filterClass}
                                            onChange={(e) => setFilterClass(e.target.value)}
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
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        label="Search Events"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Search />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Paper>

                <TableContainer component={Paper} elevation={3}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell>
                                    <TableSortLabel
                                        active={orderBy === 'title'}
                                        direction={orderBy === 'title' ? order : 'asc'}
                                        onClick={() => handleRequestSort('title')}
                                    >
                                        Title
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={orderBy === 'startDate'}
                                        direction={orderBy === 'startDate' ? order : 'asc'}
                                        onClick={() => handleRequestSort('startDate')}
                                    >
                                        Start Date
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={orderBy === 'endDate'}
                                        direction={orderBy === 'endDate' ? order : 'asc'}
                                        onClick={() => handleRequestSort('endDate')}
                                    >
                                        End Date
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={orderBy === 'eventType'}
                                        direction={orderBy === 'eventType' ? order : 'asc'}
                                        onClick={() => handleRequestSort('eventType')}
                                    >
                                        Type
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>Class</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        Loading events...
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        Error loading events: {error}
                                    </TableCell>
                                </TableRow>
                            ) : filteredEvents && filteredEvents.length > 0 ? (
                                filteredEvents
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((event) => (
                                    <TableRow key={event._id}>
                                        <TableCell>{event.title}</TableCell>
                                        <TableCell>{event.description && event.description.length > 50
                                            ? `${event.description.substring(0, 50)}...`
                                            : event.description}</TableCell>
                                        <TableCell>{formatDate(event.startDate)}</TableCell>
                                        <TableCell>{formatDate(event.endDate)}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={event.eventType} 
                                                sx={{ 
                                                    backgroundColor: getEventTypeColor(event.eventType),
                                                    color: 'white' 
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>{event.sclassName?.sclassName || 'All Classes'}</TableCell>
                                        <TableCell>
                                            <Tooltip title="Edit Event">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleEditEvent(event._id)}
                                                >
                                                    <Edit />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Event">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDeleteEvent(event._id)}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No events found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredEvents ? filteredEvents.length : 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
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
                                    onChange={(e) => setFormData({...formData, startDate: new Date(e.target.value)})}
                                    fullWidth
                                    required
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={14} sm={7}>
                                <TextField
                                    name="endDate"
                                    label="End Date"
                                    type="date"
                                    value={formData.endDate instanceof Date 
                                        ? formData.endDate.toISOString().split('T')[0]
                                        : new Date(formData.endDate).toISOString().split('T')[0]}
                                    onChange={(e) => setFormData({...formData, endDate: new Date(e.target.value)})}
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

export default AdminEventsFixed;
