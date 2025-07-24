import { Container, Grid, Paper, Typography, CircularProgress, Fade, Snackbar, Alert, Box } from '@mui/material'
import SeeNotice from '../../components/SeeNotice';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { getAllSclasses } from '../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import { getAllTeachers } from '../../redux/teacherRelated/teacherHandle';
import { getAllNotices } from '../../redux/noticeRelated/noticeHandle';
import { getAllEvents } from '../../redux/eventRelated/eventHandle';
import { getAllAssignments } from '../../redux/assignmentRelated/assignmentHandle';
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
    Class as ClassIcon,
    Person as TeacherIcon,
    School as SchoolIcon
} from '@mui/icons-material';

const AdminHomePage = () => {
    const dispatch = useDispatch();
    const [showAlert, setShowAlert] = useState(false);
    const [alertInfo, setAlertInfo] = useState({ severity: 'success', message: '' });
    const [dataLoaded, setDataLoaded] = useState(false);
    const [recentActivities, setRecentActivities] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [performanceData, setPerformanceData] = useState([]);

    // Get data from Redux store
    const { studentsList, loading: studentsLoading } = useSelector((state) => state.student);
    const { sclassesList, loading: classesLoading } = useSelector((state) => state.sclass);
    const { teachersList, loading: teachersLoading } = useSelector((state) => state.teacher);
    const { currentUser } = useSelector(state => state.user);
    const { noticesList } = useSelector(state => state.notice);
    const { eventsList } = useSelector(state => state.event);
    const { assignments } = useSelector(state => state.assignment);

    const adminID = currentUser._id;

    // Fetch all required data
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // Set a timeout to show an error if data doesn't load within 10 seconds
                const timeout = setTimeout(() => {
                    if (!dataLoaded) {
                        setAlertInfo({
                            severity: 'error',
                            message: 'There was a problem loading some data. Please refresh the page.'
                        });
                        setShowAlert(true);
                    }
                }, 10000);

                // Fetch all the required data in parallel
                await Promise.all([
                    dispatch(getAllStudents(adminID)),
                    dispatch(getAllSclasses(adminID, "Sclass")),
                    dispatch(getAllTeachers(adminID)),
                    dispatch(getAllNotices(adminID, "Notice")),
                    dispatch(getAllEvents(adminID)),
                    dispatch(getAllAssignments(adminID))
                ]);

                setDataLoaded(true);
                clearTimeout(timeout);
                
                // Success notification
                setAlertInfo({
                    severity: 'success',
                    message: 'Dashboard updated with the latest school information'
                });
                setShowAlert(true);
            } catch (error) {
                console.error("Error fetching data:", error);
                setAlertInfo({
                    severity: 'error',
                    message: 'Failed to load some dashboard data. Please try again later.'
                });
                setShowAlert(true);
            }
        };

        if (adminID) {
            fetchAllData();
        }
    }, [adminID, dispatch, dataLoaded]);

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
                    type: event.eventType.toLowerCase()
                }));
            
            setUpcomingEvents(upcoming);

            // Add some event activities
            const eventActivities = eventsList.slice(0, 3).map((event, index) => ({
                id: `event-${index}`,
                message: `New event scheduled: "${event.title}"`,
                time: new Date(event.createdAt || Date.now()),
                type: 'calendar',
                user: 'School Admin'
            }));

            setRecentActivities(prev => [...eventActivities, ...prev].slice(0, 5));
        }
    }, [eventsList]);

    // Process notices, assignments, and other data for activities
    useEffect(() => {
        const activities = [];

        // Add notice activities
        if (noticesList && noticesList.length > 0) {
            const noticeActivities = noticesList.slice(0, 2).map((notice, index) => ({
                id: `notice-${index}`,
                message: `New notice published: "${notice.title}"`,
                time: new Date(notice.date),
                type: 'announcement',
                user: 'School Admin'
            }));
            activities.push(...noticeActivities);
        }

        // Add assignment activities
        if (assignments && assignments.length > 0) {
            const assignmentActivities = assignments.slice(0, 2).map((assignment, index) => ({
                id: `assignment-${index}`,
                message: `New assignment created for ${assignment.sclassName?.sclassName}: "${assignment.title}"`,
                time: new Date(assignment.assignedDate || Date.now()),
                type: 'assignment',
                user: assignment.assignedBy?.name || 'Teacher'
            }));
            activities.push(...assignmentActivities);
        }

        // Add user activities
        if (studentsList && studentsList.length > 0) {
            activities.push({
                id: 'student-activity',
                message: `${studentsList.length} students are now registered in the system`,
                time: new Date(Date.now() - 86400000), // 1 day ago
                type: 'user',
                user: 'System'
            });
        }

        if (teachersList && teachersList.length > 0) {
            activities.push({
                id: 'teacher-activity',
                message: `${teachersList.length} teachers are now registered in the system`,
                time: new Date(Date.now() - 172800000), // 2 days ago
                type: 'user',
                user: 'System'
            });
        }

        // Sort by time and set to state
        activities.sort((a, b) => b.time - a.time);
        setRecentActivities(activities.slice(0, 5));
    }, [noticesList, assignments, studentsList, teachersList]);

    // Create performance data
    useEffect(() => {
        if (studentsList && teachersList && assignments) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            
            // For a real system, we would calculate real attendance rates, grades, etc.
            // Here we'll simulate some plausible school performance metrics
            const data = months.map((month, index) => {
                // Simulate increasing attendance and performance over time
                const baseAttendance = 78 + index * 2;
                const basePerformance = 75 + index * 3;
                
                return {
                    name: month,
                    attendance: Math.min(98, Math.round(baseAttendance + Math.random() * 5 - 2)),
                    performance: Math.min(95, Math.round(basePerformance + Math.random() * 6 - 3)),
                    assignments: Math.min(95, Math.round(80 + index * 2 + Math.random() * 8 - 4)),
                };
            });
            
            setPerformanceData(data);
        }
    }, [studentsList, teachersList, assignments]);

    const numberOfStudents = studentsList && studentsList.length;
    const numberOfClasses = sclassesList && sclassesList.length;
    const numberOfTeachers = teachersList && teachersList.length;

    // Calculate school performance as a weighted average of different metrics
    const calculateSchoolPerformance = () => {
        if (!studentsList || !teachersList || !assignments) return 0;
        
        // In a real system, this would be calculated from actual metrics
        // Here we'll simulate a plausible school performance score
        const studentTeacherRatio = studentsList.length / (teachersList.length || 1);
        const ratioBenefit = Math.min(20, Math.max(0, 20 - studentTeacherRatio));
        
        const classesWeight = Math.min(25, numberOfClasses * 2);
        const teachersWeight = Math.min(25, numberOfTeachers * 3);
        const basePerformance = 70;
        
        return Math.round(basePerformance + ratioBenefit + (classesWeight + teachersWeight) / 2);
    };

    const schoolPerformance = calculateSchoolPerformance();

    return (
        <>
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Grid container spacing={3}>
                    {/* Enhanced Stats Cards Row */}
                    <Grid item xs={12} md={3}>
                        <Fade in={!studentsLoading} timeout={1000}>
                            <div>
                                <EnhancedStatsCard
                                    title="Total Students"
                                    value={numberOfStudents || 0}
                                    icon={<PeopleIcon />}
                                    color="primary"
                                    changeValue={numberOfStudents > 10 ? 8.5 : 0}
                                    progress={Math.min(100, (numberOfStudents / 100) * 100)}
                                    target={100}
                                    duration={2.5}
                                />
                            </div>
                        </Fade>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Fade in={!classesLoading} timeout={1000} style={{ transitionDelay: '150ms' }}>
                            <div>
                                <EnhancedStatsCard
                                    title="Total Classes"
                                    value={numberOfClasses || 0}
                                    icon={<ClassIcon />}
                                    color="secondary"
                                    changeValue={numberOfClasses > 2 ? 5.2 : 0}
                                    duration={3}
                                />
                            </div>
                        </Fade>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Fade in={!teachersLoading} timeout={1000} style={{ transitionDelay: '300ms' }}>
                            <div>
                                <EnhancedStatsCard
                                    title="Total Teachers"
                                    value={numberOfTeachers || 0}
                                    icon={<TeacherIcon />}
                                    color="success"
                                    changeValue={numberOfTeachers > 2 ? 12.7 : 0}
                                    duration={2.5}
                                />
                            </div>
                        </Fade>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Fade in={dataLoaded} timeout={1000} style={{ transitionDelay: '450ms' }}>
                            <div>
                                <EnhancedStatsCard
                                    title="School Performance"
                                    value={schoolPerformance}
                                    icon={<SchoolIcon />}
                                    color="warning"
                                    suffix="%"
                                    changeValue={3.6}
                                    duration={2.5}
                                />
                            </div>
                        </Fade>
                    </Grid>                    {/* Quick Actions Section */}
                    <Grid item xs={12}>
                        <QuickActions role="admin" />
                    </Grid>

                    {/* Messaging Center */}
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
                                School Communication Center
                            </Typography>
                            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                                <MessageChat role="admin" />
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Performance Chart */}
                    <Grid item xs={12} md={8}>
                        {dataLoaded ? (
                            <PerformanceChart 
                                title="School Performance Overview" 
                                data={performanceData}
                            />
                        ) : (
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
                        )}
                    </Grid>

                    {/* Calendar Component */}
                    <Grid item xs={12} md={4}>
                        <UpcomingCalendar 
                            userEvents={upcomingEvents}
                        />
                    </Grid>

                    {/* Recent Activity and Notices */}
                    <Grid item xs={12} md={4}>
                        <RecentActivity 
                            activities={recentActivities}
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
                            minHeight: '400px' 
                        }}>
                            {studentsLoading || classesLoading || teachersLoading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <CircularProgress />
                                </div>
                            ) : (
                                <SeeNotice />
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

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
    );
};

export default AdminHomePage
