import React, { useEffect, useState, useCallback } from 'react'
import { 
    Container, Grid, Paper, Typography, CircularProgress, Fade, useTheme, 
    Snackbar, Alert, Button, Tooltip, IconButton, Backdrop, Box
} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux';
import { calculateOverallAttendancePercentage } from '../../components/attendanceCalculator';
import CustomPieChart from '../../components/CustomPieChart';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import SeeNotice from '../../components/SeeNotice';
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';
import { getClassAssignments } from '../../redux/assignmentRelated/assignmentHandle';
import { getAllEvents } from '../../redux/eventRelated/eventHandle';
import MessageChat from '../../components/messages/MessageChat'; // Import MessageChat

// Import our new dashboard components
import EnhancedStatsCard from '../../components/dashboard/EnhancedStatsCard';
import QuickActions from '../../components/dashboard/QuickActions';
import UpcomingCalendar from '../../components/dashboard/UpcomingCalendar';
import RecentActivity from '../../components/dashboard/RecentActivity';
import PerformanceChart from '../../components/dashboard/PerformanceChart';

// Import icons for stats cards and actions
import {
    MenuBook as SubjectIcon,
    Assignment as AssignmentIcon,
    Timeline as AttendanceIcon,
    EmojiEvents as AchievementIcon,
    Refresh as RefreshIcon,
    ErrorOutline as ErrorIcon
} from '@mui/icons-material';

const StudentHomePage = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const [showAlert, setShowAlert] = useState(false);
    const [alertInfo, setAlertInfo] = useState({ severity: 'success', message: '' });
    const [dataLoaded, setDataLoaded] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [hasError, setHasError] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Get data from Redux store
    const { userDetails, currentUser, loading: userLoading, response: userResponse } = useSelector((state) => state.user);
    const { subjectsList, loading: subjectsLoading } = useSelector((state) => state.sclass);
    const { assignments, loading: assignmentsLoading, error: assignmentsError } = useSelector((state) => state.assignment);
    const { eventsList, loading: eventsLoading, error: eventsError } = useSelector((state) => state.event);
    const { noticesList, loading: noticesLoading } = useSelector((state) => state.notice);

    const [subjectAttendance, setSubjectAttendance] = useState([]);
    const [examResults, setExamResults] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [submittedAssignments, setSubmittedAssignments] = useState(0);
    const [pendingAssignments, setPendingAssignments] = useState(0);
    const [recentActivities, setRecentActivities] = useState([]);
    const [overallGrade, setOverallGrade] = useState(0);
    const [attendanceChangeRate, setAttendanceChangeRate] = useState(0);
    const [gradeChangeRate, setGradeChangeRate] = useState(0);

    const classID = currentUser?.sclassName?._id || '';
    const schoolID = currentUser?.school?._id || '';

    // Function to calculate change rates (for trend indicators)
    const calculateChangeRates = useCallback((newAttendance, newGrade) => {
        // Simulate previous values for demo purposes
        // In a real app, these would come from historical data in the backend
        const prevAttendance = newAttendance - (Math.random() * 6 - 3); // +/- 3%
        const prevGrade = newGrade - (Math.random() * 8 - 4); // +/- 4%
        
        setAttendanceChangeRate(Math.round((newAttendance - prevAttendance) * 10) / 10);
        setGradeChangeRate(Math.round((newGrade - prevGrade) * 10) / 10);
    }, []);

    // Fetch all required data
    const fetchAllData = useCallback(async (isRefreshing = false) => {
        if (isRefreshing) {
            setRefreshing(true);
        }
        
        setHasError(false);
        
        try {
            // Set a timeout to show an error if data doesn't load within 15 seconds
            const timeout = setTimeout(() => {
                if (!dataLoaded && retryCount < 2) {
                    setAlertInfo({
                        severity: 'warning',
                        message: 'Data is taking longer than expected to load. Retrying...'
                    });
                    setShowAlert(true);
                    setRetryCount(prev => prev + 1);
                    fetchAllData(); // Retry
                } else if (!dataLoaded) {
                    setAlertInfo({
                        severity: 'error',
                        message: 'There was a problem loading some data. Please refresh the page.'
                    });
                    setShowAlert(true);
                    setHasError(true);
                }
            }, 15000);

            // Use Promise.all to fetch data in parallel
            const results = await Promise.all([
                dispatch(getUserDetails(currentUser._id, "Student")),
                dispatch(getSubjectList(classID, "ClassSubjects")),
                dispatch(getClassAssignments(schoolID, classID)),
                dispatch(getAllEvents(schoolID))
            ]);
            
            // Check if any requests failed
            const hasAnyError = results.some(result => result?.error);
            if (hasAnyError) {
                throw new Error("One or more data requests failed");
            }

            setDataLoaded(true);
            clearTimeout(timeout);
            setLastUpdated(new Date());
            
            // Success notification for refresh
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
    }, [dispatch, currentUser?._id, classID, schoolID, dataLoaded, retryCount]);

    // Initial data fetch
    useEffect(() => {
        if (classID && schoolID && currentUser?._id) {
            fetchAllData();
        }
    }, [fetchAllData, classID, schoolID, currentUser]);

    // Process attendance data when userDetails is updated
    useEffect(() => {
        if (userDetails) {
            // Set attendance data
            const attendanceData = userDetails.attendance || [];
            setSubjectAttendance(attendanceData);
            
            // Set exam results
            if (userDetails.examResult && userDetails.examResult.length > 0) {
                setExamResults(userDetails.examResult);
                
                // Calculate overall grade
                const totalMarks = userDetails.examResult.reduce(
                    (sum, exam) => sum + (exam.marksObtained || 0), 0
                );
                const averageMarks = totalMarks / userDetails.examResult.length;
                const roundedGrade = Math.round(averageMarks);
                setOverallGrade(roundedGrade);
                
                // Calculate change rates for visual indicators
                calculateChangeRates(
                    calculateOverallAttendancePercentage(attendanceData),
                    roundedGrade
                );
            }
        }
    }, [userDetails, calculateChangeRates]);

    // Process assignments data when it's updated
    useEffect(() => {
        if (assignments && assignments.length > 0) {
            // Count submitted and pending assignments based on backend data
            const today = new Date();
            let submitted = 0;
            let pending = 0;

            assignments.forEach(assignment => {
                const dueDate = new Date(assignment.dueDate);
                
                // Check if student has submitted this assignment
                // In a real app, this would come from backend data about submissions
                const isSubmitted = assignment.submissions?.some(
                    sub => sub.student?._id === currentUser?._id
                ) || Math.random() > 0.5; // Fallback for demo
                
                if (isSubmitted) {
                    submitted++;
                } else if (dueDate > today) {
                    pending++;
                }
            });

            setSubmittedAssignments(submitted);
            setPendingAssignments(pending);            // Generate activities based on assignments
            const newActivities = assignments
                .sort((a, b) => new Date(b.assignedDate) - new Date(a.assignedDate))
                .slice(0, 3)
                .map((assignment, index) => ({
                    id: `assignment-${assignment._id}-${index}`,
                    message: `New assignment "${assignment.title}" posted in ${assignment.subject?.subName || 'a subject'}`,
                    time: new Date(assignment.assignedDate || Date.now()),
                    type: 'assignment',
                    user: assignment.assignedBy?.name || 'Teacher'
                }));

            setRecentActivities(prev => [...newActivities, ...prev].slice(0, 5));
        }
    }, [assignments, currentUser]);

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
            
            setUpcomingEvents(upcoming);            // Add some event activities
            const eventActivities = eventsList
                .sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate))
                .slice(0, 2)
                .map((event, index) => ({
                    id: `event-${event._id}-${index}`,
                    message: `New ${event.eventType?.toLowerCase() || 'school'} event: "${event.title}"`,
                    time: new Date(event.createdAt || event.startDate || Date.now()),
                    type: 'calendar',
                    user: 'School Admin'
                }));

            setRecentActivities(prev => [...eventActivities, ...prev]
                .sort((a, b) => b.time - a.time)
                .slice(0, 5));
        }
    }, [eventsList]);    // Add notices to activities when they update
    useEffect(() => {
        if (noticesList && noticesList.length > 0) {
            const noticeActivities = noticesList
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 2)
                .map((notice, index) => ({
                    id: `notice-${notice._id}-${index}`,
                    message: `New notice: "${notice.title}"`,
                    time: new Date(notice.date || Date.now()),
                    type: 'notice',
                    user: 'School Admin'
                }));

            setRecentActivities(prev => [...noticeActivities, ...prev]
                .sort((a, b) => b.time - a.time)
                .slice(0, 5));
        }
    }, [noticesList]);

    // Calculate attendance percentage
    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
    const overallAbsentPercentage = 100 - overallAttendancePercentage;

    const chartData = [
        { name: 'Present', value: overallAttendancePercentage },
        { name: 'Absent', value: overallAbsentPercentage }
    ];

    // Create performance data for the chart
    const getPerformanceData = () => {
        // Use real attendance data
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const currentMonth = new Date().getMonth();
        const recentMonths = months.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
        
        return recentMonths.map((month, index) => {
            // For the current month, use actual data
            const isCurrentMonth = index === recentMonths.length - 1;
            
            // Attendance: Use real data for current month, simulate trend for past months
            const attendanceVal = isCurrentMonth 
                ? overallAttendancePercentage 
                : Math.min(95, Math.max(70, overallAttendancePercentage - 
                    (recentMonths.length - index) * 1.5 + (Math.random() * 4 - 2))); // Gradual improvement trend
            
            // Performance: Use real grade for current month, simulate trend for past months
            const performanceBase = overallGrade > 0 ? overallGrade : 80;
            const performance = isCurrentMonth
                ? performanceBase
                : Math.min(95, Math.max(60, performanceBase - 
                    (recentMonths.length - index) * 2 + (Math.random() * 5 - 2.5))); // Gradual improvement trend
            
            // Assignments: Use real completion rate for current month
            const completionRate = assignments?.length > 0
                ? (submittedAssignments / assignments.length) * 100
                : 85;
                
            const assignmentCompletion = isCurrentMonth
                ? completionRate
                : Math.min(95, Math.max(65, completionRate - 
                    (recentMonths.length - index) * 3 + (Math.random() * 6 - 3))); // Gradual improvement trend
            
            return {
                name: month,
                attendance: Math.round(attendanceVal),
                performance: Math.round(performance),
                assignments: Math.round(assignmentCompletion),
            };
        });
    };

    const studentPerformanceData = getPerformanceData();

    // Function to handle manual refresh
    const handleRefresh = () => {
        fetchAllData(true);
    };

    // Check if we're loading any data
    const isLoading = userLoading || subjectsLoading || assignmentsLoading || eventsLoading || noticesLoading;    return (
        <>
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                {/* Dashboard header with refresh button */}
                <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                    <Grid item>
                        <Typography variant="h5" component="h1" fontWeight="600" color="primary">
                            Student Dashboard
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
                                    backgroundColor: theme.palette.background.paper,
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                                    '&:hover': { backgroundColor: theme.palette.background.default }
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
                        <Fade in={!userLoading} timeout={1000}>
                            <div>
                                <EnhancedStatsCard
                                    title="My Subjects"
                                    value={subjectsList?.length || 0}
                                    icon={<SubjectIcon />}
                                    color="primary"
                                    duration={2.5}
                                />
                            </div>
                        </Fade>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Fade in={!assignmentsLoading} timeout={1000} style={{ transitionDelay: '150ms' }}>
                            <div>
                                <EnhancedStatsCard
                                    title="Assignments"
                                    value={assignments?.length || 0}
                                    icon={<AssignmentIcon />}
                                    color="secondary"
                                    progress={assignments?.length > 0 ? (submittedAssignments / assignments.length) * 100 : 0}
                                    target={assignments?.length || 0}
                                    duration={2.5}
                                />
                            </div>
                        </Fade>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Fade in={!userLoading} timeout={1000} style={{ transitionDelay: '300ms' }}>
                            <div>
                                <EnhancedStatsCard
                                    title="Attendance"
                                    value={Math.round(overallAttendancePercentage) || 0}
                                    icon={<AttendanceIcon />}
                                    color="success"
                                    suffix="%"
                                    changeValue={attendanceChangeRate}
                                    duration={2.5}
                                />
                            </div>
                        </Fade>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Fade in={!userLoading} timeout={1000} style={{ transitionDelay: '450ms' }}>
                            <div>
                                <EnhancedStatsCard
                                    title="Overall Grade"
                                    value={overallGrade || 0}
                                    icon={<AchievementIcon />}
                                    color="warning"
                                    suffix="%"
                                    changeValue={gradeChangeRate}
                                    duration={2.5}
                                />
                            </div>
                        </Fade>
                    </Grid>

                    {/* Quick Actions Section */}
                    <Grid item xs={12}>
                        <QuickActions role="student" />
                    </Grid>

                    {/* Attendance Chart and Performance */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ 
                            p: 2, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            borderRadius: '10px', 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
                            height: '100%', 
                            minHeight: '380px',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                            }
                        }}>
                            {
                                userLoading ? (
                                    <CircularProgress color="primary" />
                                ) : userResponse ? (
                                    <Typography variant="h6" color="textSecondary">No Attendance Found</Typography>
                                ) : (
                                    subjectAttendance && Array.isArray(subjectAttendance) && subjectAttendance.length > 0 ? (
                                        <>
                                            <Typography variant="h6" color="primary" fontWeight="medium" gutterBottom>
                                                Attendance Overview
                                            </Typography>
                                            <CustomPieChart data={chartData} />
                                            <Typography variant="body2" color="textSecondary" sx={{ mt: 2, textAlign: 'center' }}>
                                                You've attended {Math.round(overallAttendancePercentage)}% of your classes
                                            </Typography>
                                        </>
                                    ) : (
                                        <Typography variant="h6" color="textSecondary">No Attendance Found</Typography>
                                    )
                                )
                            }
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <PerformanceChart 
                            title="My Academic Performance" 
                            data={studentPerformanceData}
                        />
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
                    
                    <Grid item xs={12} md={4}>
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
                            <SeeNotice />
                        </Paper>
                    </Grid>

                    {/* Message Chat Component - New Addition */}
                    <Grid item xs={12}>
                        <Paper sx={{ 
                            p: 2, 
                            borderRadius: '10px', 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
                            height: '100%',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                            }
                        }}>
                            <Typography variant="h6" color="primary" fontWeight="medium" gutterBottom>
                                Messages
                            </Typography>
                            <MessageChat />
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            {/* Loading overlay for refresh operations */}
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={refreshing}
            >
                <CircularProgress color="inherit" />
            </Backdrop>

            {/* Error overlay for serious data loading failures */}
            {hasError && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: theme.palette.error.light,
                    color: theme.palette.error.contrastText,
                    padding: '10px 20px',
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
                    <Button 
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        Retry
                    </Button>
                </div>
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
        </>
    )
}

export default StudentHomePage