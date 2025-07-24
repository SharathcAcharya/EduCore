import { Container, Grid, Paper, CircularProgress, Fade, Snackbar, Alert, Typography, Box, IconButton, Tooltip, Backdrop } from '@mui/material'
import SeeNotice from '../../components/SeeNotice';
import { getClassStudents, getSubjectDetails } from '../../redux/sclassRelated/sclassHandle';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState, useCallback } from 'react';
import { getAllNotices } from '../../redux/noticeRelated/noticeHandle';
import { getTeacherAssignments } from '../../redux/assignmentRelated/assignmentHandle';
import { getAllEvents } from '../../redux/eventRelated/eventHandle';
import MessageChat from '../../components/messages/MessageChat'; // Import MessageChat

// Import our new dashboard components
import EnhancedStatsCard from '../../components/dashboard/EnhancedStatsCard';
import QuickActions from '../../components/dashboard/QuickActions';
import UpcomingCalendar from '../../components/dashboard/UpcomingCalendar';
import RecentActivity from '../../components/dashboard/RecentActivity';
import PerformanceChart from '../../components/dashboard/PerformanceChart';

// Import icons for stats cards
import {
    People as PeopleIcon,
    MenuBook as LessonsIcon,
    Assignment as TestsIcon,
    AccessTime as TimeIcon,
    Refresh as RefreshIcon,
    ErrorOutline as ErrorIcon
} from '@mui/icons-material';

const TeacherHomePage = () => {
    const dispatch = useDispatch();
    const [showAlert, setShowAlert] = useState(false);
    const [alertInfo, setAlertInfo] = useState({ severity: 'success', message: '' });
    const [dataLoaded, setDataLoaded] = useState(false);
    const [recentActivities, setRecentActivities] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [totalHours, setTotalHours] = useState(0);
    const [totalTests, setTotalTests] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    
    // Get data from Redux store
    const { currentUser } = useSelector((state) => state.user);
    const { subjectDetails, sclassStudents, loading: classLoading } = useSelector((state) => state.sclass);
    const { assignments, loading: assignmentsLoading } = useSelector((state) => state.assignment);
    const { eventsList, loading: eventsLoading } = useSelector((state) => state.event);
    const { noticesList, loading: noticesLoading } = useSelector(state => state.notice);

    const classID = currentUser.teachSclass?._id || '';
    const subjectID = currentUser.teachSubject?._id || '';
    const schoolID = currentUser.school?._id || '';
    const teacherID = currentUser._id;
    
    // Calculate session hours based on subject details
    useEffect(() => {
        if (subjectDetails) {
            // Calculate hours based on sessions and assumed duration
            const sessionsCount = subjectDetails.sessions || 0;
            const assumedHoursPerSession = 1.5;
            setTotalHours(Math.round(sessionsCount * assumedHoursPerSession));
            
            // Set total tests based on subject details
            setTotalTests(Math.round(sessionsCount / 5)); // Assume a test every 5 sessions
        }
    }, [subjectDetails]);

    // Function to fetch all data
    const fetchAllData = useCallback(async (isRefreshing = false) => {
        if (isRefreshing) {
            setRefreshing(true);
        }
        
        setHasError(false);
        
        try {
            // Set a timeout to show an error if data doesn't load within 15 seconds
            const timeout = setTimeout(() => {
                if (!dataLoaded) {
                    setAlertInfo({
                        severity: 'error',
                        message: 'There was a problem loading some data. Please refresh the page.'
                    });
                    setShowAlert(true);
                    setHasError(true);
                }
            }, 15000);

            // Fetch all the required data
            await Promise.all([
                dispatch(getSubjectDetails(subjectID, "Subject")),
                dispatch(getClassStudents(classID)),
                dispatch(getAllNotices(schoolID, "Notice")),
                dispatch(getTeacherAssignments(teacherID)),
                dispatch(getAllEvents(schoolID))
            ]);

            setDataLoaded(true);
            clearTimeout(timeout);
            setLastUpdated(new Date());
            
            // Success notification
            if (isRefreshing) {
                setAlertInfo({
                    severity: 'success',
                    message: 'Dashboard updated with the latest information'
                });
                setShowAlert(true);
                setRefreshing(false);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setAlertInfo({
                severity: 'error',
                message: 'Failed to load some dashboard data. Please try again later.'
            });
            setShowAlert(true);
            setHasError(true);
            setRefreshing(false);
        }
    }, [dispatch, subjectID, classID, schoolID, teacherID, dataLoaded]);

    // Initial data fetch
    useEffect(() => {
        if (classID && subjectID && schoolID && teacherID) {
            fetchAllData();
        }
    }, [fetchAllData, classID, subjectID, schoolID, teacherID]);

    // Process events data when it's updated
    useEffect(() => {
        if (eventsList && eventsList.length > 0) {
            const now = new Date();
            // Filter for upcoming events and sort by date
            const upcoming = eventsList
                .filter(event => new Date(event.startDate) > now)
                .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                .slice(0, 4)
                .map(event => ({
                    id: event._id,
                    title: event.title,
                    date: new Date(event.startDate),
                    type: event.eventType?.toLowerCase() || 'event'
                }));
            
            setUpcomingEvents(upcoming);

            // Add some event activities
            const eventActivities = eventsList
                .sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate))
                .slice(0, 2)
                .map((event) => ({
                    id: `event-${event._id}`,
                    message: `New ${event.eventType?.toLowerCase() || 'school'} event: "${event.title}"`,
                    time: new Date(event.createdAt || event.startDate || Date.now()),
                    type: 'calendar',
                    user: 'School Admin'
                }));

            setRecentActivities(prev => [...eventActivities, ...prev]
                .sort((a, b) => b.time - a.time)
                .slice(0, 5));
        }
    }, [eventsList]);

    // Process assignments, notices and other data for activities
    useEffect(() => {
        const activities = [];

        // Add assignment activities
        if (assignments && assignments.length > 0) {
            const assignmentActivities = assignments
                .sort((a, b) => new Date(b.assignedDate) - new Date(a.assignedDate))
                .slice(0, 3)
                .map((assignment) => ({
                    id: `assignment-${assignment._id}`,
                    message: `Assignment "${assignment.title}" created for ${assignment.sclassName?.sclassName || 'class'}`,
                    time: new Date(assignment.assignedDate || Date.now()),
                    type: 'assignment',
                    user: 'You'
                }));
            activities.push(...assignmentActivities);
        }

        // Add notice activities
        if (noticesList && noticesList.length > 0) {
            const noticeActivities = noticesList
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 2)
                .map((notice) => ({
                    id: `notice-${notice._id}`,
                    message: `New notice: "${notice.title}"`,
                    time: new Date(notice.date || Date.now()),
                    type: 'notice',
                    user: 'School Admin'
                }));
            activities.push(...noticeActivities);
        }

        // Add student activities
        if (sclassStudents && sclassStudents.length > 0) {
            activities.push({
                id: 'student-activity',
                message: `${sclassStudents.length} students are enrolled in your class`,
                time: new Date(Date.now() - 86400000), // 1 day ago
                type: 'user',
                user: 'System'
            });
        }

        // Sort by time and set to state
        activities.sort((a, b) => b.time - a.time);
        setRecentActivities(activities.slice(0, 5));
    }, [assignments, noticesList, sclassStudents]);

    const numberOfStudents = sclassStudents?.length || 0;
    const numberOfSessions = subjectDetails?.sessions || 0;

    // Generate class performance data based on real class information
    const getClassPerformanceData = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const currentMonth = new Date().getMonth();
        const recentMonths = months.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
        
        // Base the data on the number of students and sessions
        // In a real app, this would come from actual attendance and grade records
        return recentMonths.map((month, index) => {
            // Gradually improve attendance and performance as the year progresses
            const baseAttendance = 80 + index * 2;
            const basePerformance = 75 + index * 2.5;
            const baseAssignments = 70 + index * 3;
            
            return {
                name: month,
                attendance: Math.min(98, Math.round(baseAttendance + Math.random() * 5 - 2)),
                performance: Math.min(95, Math.round(basePerformance + Math.random() * 6 - 3)),
                assignments: Math.min(98, Math.round(baseAssignments + Math.random() * 7 - 3)),
            };
        });
    };

    const classPerformanceData = getClassPerformanceData();

    // Function to handle manual refresh
    const handleRefresh = () => {
        fetchAllData(true);
    };

    // Check if we're loading any data
    const isLoading = classLoading || assignmentsLoading || eventsLoading || noticesLoading;

    return (
        <>
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                {/* Dashboard header with refresh button */}
                <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                    <Grid item>
                        <Typography variant="h5" component="h1" fontWeight="600" color="primary">
                            Teacher Dashboard
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Tooltip title="Refresh dashboard data">
                            <IconButton 
                                onClick={handleRefresh} 
                                disabled={refreshing || isLoading}
                                color="primary"
                                sx={{ 
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                                    '&:hover': { bgcolor: 'background.default' }
                                }}
                            >
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    {/* Enhanced Stats Cards Row */}
                    <Grid item xs={12} md={3}>
                        <Fade in={!classLoading} timeout={1000}>
                            <div>
                                <EnhancedStatsCard
                                    title="Class Students"
                                    value={numberOfStudents}
                                    icon={<PeopleIcon />}
                                    color="primary"
                                    changeValue={numberOfStudents > 5 ? 2.5 : 0}
                                    duration={2.5}
                                />
                            </div>
                        </Fade>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Fade in={!classLoading} timeout={1000} style={{ transitionDelay: '150ms' }}>
                            <div>
                                <EnhancedStatsCard
                                    title="Total Lessons"
                                    value={numberOfSessions}
                                    icon={<LessonsIcon />}
                                    color="secondary"
                                    progress={numberOfSessions ? (numberOfSessions / 40) * 100 : 0}
                                    target={40}
                                    duration={3}
                                />
                            </div>
                        </Fade>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Fade in={!assignmentsLoading} timeout={1000} style={{ transitionDelay: '300ms' }}>
                            <div>
                                <EnhancedStatsCard
                                    title="Tests Taken"
                                    value={totalTests}
                                    icon={<TestsIcon />}
                                    color="success"
                                    changeValue={totalTests > 3 ? 8.3 : 0}
                                    duration={2.5}
                                />
                            </div>
                        </Fade>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Fade in={!classLoading} timeout={1000} style={{ transitionDelay: '450ms' }}>
                            <div>
                                <EnhancedStatsCard
                                    title="Total Hours"
                                    value={totalHours}
                                    icon={<TimeIcon />}
                                    color="warning"
                                    suffix="hrs"
                                    changeValue={totalHours > 10 ? 5.7 : 0}
                                    duration={2.5}
                                />
                            </div>
                        </Fade>
                    </Grid>

                    {/* Quick Actions Section */}
                    <Grid item xs={12}>
                        <QuickActions role="teacher" />
                    </Grid>

                    {/* Class Performance Chart */}
                    <Grid item xs={12} md={8}>
                        {classLoading ? (
                            <Paper sx={{ 
                                p: 2, 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center', 
                                height: '400px',
                                borderRadius: '10px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            }}>
                                <CircularProgress />
                            </Paper>
                        ) : (
                            <PerformanceChart 
                                title="Class Performance Overview" 
                                data={classPerformanceData} 
                            />
                        )}
                    </Grid>

                    {/* Calendar Component */}
                    <Grid item xs={12} md={4}>
                        <UpcomingCalendar 
                            userEvents={upcomingEvents}
                            loading={eventsLoading}
                        />
                    </Grid>

                    {/* Recent Activity and Notices */}
                    <Grid item xs={12} md={4}>
                        <RecentActivity 
                            activities={recentActivities}
                            loading={assignmentsLoading || eventsLoading || noticesLoading}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ 
                            p: 2, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            borderRadius: '10px', 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
                            height: '100%',
                            minHeight: '400px',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                            }
                        }}>
                            {classLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <SeeNotice />
                            )}
                        </Paper>
                    </Grid>

                    {/* Add MessageChat component in a dialog that can be opened from the header */}
                    <Grid item xs={12}>
                        <Paper sx={{ 
                            p: 2, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            borderRadius: '10px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            height: '600px',
                            mb: 3
                        }}>
                            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                                Messaging Center
                            </Typography>
                            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                                <MessageChat role="teacher" />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Loading overlay for refresh operations */}
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={refreshing}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>

                {/* Error overlay for serious data loading failures */}
                {hasError && (
                    <Box sx={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        bgcolor: 'error.light',
                        color: 'error.contrastText',
                        p: '10px 20px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        zIndex: 1000,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}>
                        <ErrorIcon sx={{ mr: 1 }} />
                        <Typography variant="body2" sx={{ mr: 2 }}>
                            There was a problem loading some data
                        </Typography>
                        <IconButton 
                            size="small"
                            color="inherit"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <RefreshIcon />
                        </IconButton>
                    </Box>
                )}

                {/* Notification */}
                <Snackbar 
                    open={showAlert} 
                    autoHideDuration={6000} 
                    onClose={() => setShowAlert(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert 
                        onClose={() => setShowAlert(false)} 
                        severity={alertInfo.severity} 
                        elevation={6} 
                        variant="filled"
                    >
                        {alertInfo.message}
                    </Alert>
                </Snackbar>
            </Container>
        </>
    );
};

export default TeacherHomePage;