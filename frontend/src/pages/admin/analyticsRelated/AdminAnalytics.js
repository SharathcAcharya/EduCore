import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Card,
    CardContent,
    Divider,
    Tab,
    Tabs,
    CircularProgress,
    useTheme,
    Alert
} from '@mui/material';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { 
    School,
    Group,
    Person,
    MenuBook,
    Assignment,
    BarChart as BarChartIcon,
    CalendarMonth
} from '@mui/icons-material';
import { getAllSubjects } from '../../../redux/subjectRelated/subjectHandle';
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { getAllAssignments } from '../../../redux/assignmentRelated/assignmentHandle';
import { getAllEvents } from '../../../redux/eventRelated/eventHandle';

// Main component
const AdminAnalytics = () => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { sclassesList: sclasses, loading: sclassLoading, error: sclassError } = useSelector((state) => state.sclass);
    const { studentsList: students, loading: studentLoading, error: studentError } = useSelector((state) => state.student);
    const { teachersList: teachers, loading: teacherLoading, error: teacherError } = useSelector((state) => state.teacher);
    const { subjects, loading: subjectLoading, error: subjectError } = useSelector((state) => state.subject);
    const { assignments, loading: assignmentLoading, error: assignmentError } = useSelector((state) => state.assignment);
    const { events, loading: eventLoading, error: eventError } = useSelector((state) => state.event);
    
    const [tabValue, setTabValue] = useState(0);
    const [schoolStats, setSchoolStats] = useState({
        studentCount: 0,
        teacherCount: 0,
        classCount: 0,
        subjectCount: 0,
        assignmentCount: 0,
        eventCount: 0,
        attendanceRate: 0,
        maleStudents: 0,
        femaleStudents: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Calculate attendance rate from student data
    const calculateAttendanceRate = (studentsList) => {
        if (!studentsList || studentsList.length === 0) return 0;
        
        let totalAttendanceDays = 0;
        let totalPresentDays = 0;
        
        studentsList.forEach(student => {
            const attendance = student.attendance || [];
            totalAttendanceDays += attendance.length;
            totalPresentDays += attendance.filter(a => a.status === 'Present').length;
        });
        
        return totalAttendanceDays > 0 
            ? Math.round((totalPresentDays / totalAttendanceDays) * 100) 
            : 0;
    };
    
    // Generate class-wise attendance data
    const classAttendanceData = sclasses.map(sclass => {
        const classStudents = students.filter(s => s.sclassName?._id === sclass._id);
        const attendanceRate = calculateAttendanceRate(classStudents);
        return {
            name: sclass.sclassName,
            present: attendanceRate,
            absent: 100 - attendanceRate
        };
    });

    // Generate subject-wise assignment data
    const assignmentData = subjects.map(subject => {
        const subjectAssignments = assignments.filter(a => a.subjectId === subject._id);
        const submitted = subjectAssignments.reduce((acc, curr) => acc + (curr.submissions?.length || 0), 0);
        const total = subjectAssignments.length * (students.length || 1); // Assuming each student should submit each assignment
        return {
            name: subject.subName,
            submitted: Math.min(submitted, total), // Ensure we don't exceed 100%
            pending: Math.max(0, total - submitted)
        };
    });

    // Generate class performance data (partially simulated)
    const classPerformanceData = sclasses.map(sclass => {
        // Calculate average performance - in real app this would use exam results
        // For now we'll use a random value between 70-90 as a placeholder
        return {
            name: sclass.sclassName,
            average: Math.floor(Math.random() * 20) + 70 // Random value between 70-90
        };
    });    // Load data on component mount
    useEffect(() => {
        const loadData = async () => {
            if (!currentUser?.school) {
                console.error("No school ID found in current user data");
                setLoading(false);
                return;
            }
            
            setLoading(true);
            console.log("Loading analytics data for school:", currentUser.school);
            
            try {
                // Dispatch actions to load all required data
                await Promise.all([
                    dispatch(getAllSclasses(currentUser.school, "Sclass")),
                    dispatch(getAllStudents(currentUser.school)),
                    dispatch(getAllTeachers(currentUser.school)),
                    dispatch(getAllSubjects(currentUser.school)),
                    dispatch(getAllAssignments(currentUser.school)),
                    dispatch(getAllEvents(currentUser.school))
                ]);
                
                console.log("All data loaded successfully");
            } catch (err) {
                console.error("Error loading analytics data:", err);
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, [dispatch, currentUser]);
    
    // Update stats whenever the data changes
    useEffect(() => {
        if (!loading) {
            console.log("Updating school stats with:", {
                students: students?.length || 0,
                teachers: teachers?.length || 0,
                classes: sclasses?.length || 0,
                subjects: subjects?.length || 0
            });
            
            // Calculate stats from Redux store data
            setSchoolStats({
                studentCount: students?.length || 0,
                teacherCount: teachers?.length || 0,
                classCount: sclasses?.length || 0,
                subjectCount: subjects?.length || 0,
                assignmentCount: assignments?.length || 0,
                eventCount: events?.length || 0,
                attendanceRate: calculateAttendanceRate(students),
                maleStudents: students?.filter(s => s.gender === 'Male').length || 0,
                femaleStudents: students?.filter(s => s.gender === 'Female').length || 0
            });
        }
    }, [loading, students, teachers, sclasses, subjects, assignments, events]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };    // Colors for charts
    const genderColors = ['#2196f3', '#f50057'];

    // Gender data for pie chart
    const genderData = [
        { name: 'Male', value: schoolStats.maleStudents },
        { name: 'Female', value: schoolStats.femaleStudents }
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column' }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Loading analytics data...
                </Typography>
            </Box>
        );
    }

    // Check if we have data to display
    const hasData = schoolStats.classCount > 0 || schoolStats.studentCount > 0 || schoolStats.teacherCount > 0;
    
    if (!hasData) {
        return (
            <Box sx={{ p: 3 }}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom>
                        No data available for analytics
                    </Typography>
                    <Typography variant="body1" color="textSecondary" paragraph>
                        Please add classes, students, and teachers to view analytics.
                    </Typography>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                School Analytics Dashboard
            </Typography>
            
            {/* Summary Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <Card raised sx={{ height: '100%' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <School fontSize="large" color="primary" />
                            <Typography variant="h5" sx={{ mt: 1 }}>
                                {schoolStats.classCount}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Classes
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <Card raised sx={{ height: '100%' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Person fontSize="large" color="primary" />
                            <Typography variant="h5" sx={{ mt: 1 }}>
                                {schoolStats.studentCount}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Students
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <Card raised sx={{ height: '100%' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Group fontSize="large" color="primary" />
                            <Typography variant="h5" sx={{ mt: 1 }}>
                                {schoolStats.teacherCount}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Teachers
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <Card raised sx={{ height: '100%' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <MenuBook fontSize="large" color="primary" />
                            <Typography variant="h5" sx={{ mt: 1 }}>
                                {schoolStats.subjectCount}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Subjects
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <Card raised sx={{ height: '100%' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Assignment fontSize="large" color="primary" />
                            <Typography variant="h5" sx={{ mt: 1 }}>
                                {schoolStats.assignmentCount}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Assignments
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <Card raised sx={{ height: '100%' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <CalendarMonth fontSize="large" color="primary" />
                            <Typography variant="h5" sx={{ mt: 1 }}>
                                {schoolStats.eventCount}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Events
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            
            {/* Tabs for different analytics */}
            <Paper sx={{ mb: 4 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label="Attendance" icon={<Person />} />
                    <Tab label="Performance" icon={<BarChartIcon />} />
                    <Tab label="Demographics" icon={<Group />} />
                </Tabs>
                
                {/* Attendance Tab */}
                {tabValue === 0 && (
                    <Box sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                                    <Typography variant="h6" gutterBottom>
                                        Overall Attendance Rate
                                    </Typography>
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            display: 'inline-flex',
                                            justifyContent: 'center',
                                            my: 2
                                        }}
                                    >
                                        <CircularProgress
                                            variant="determinate"
                                            value={schoolStats.attendanceRate}
                                            size={200}
                                            thickness={5}
                                            sx={{ color: theme.palette.success.main }}
                                        />
                                        <Box
                                            sx={{
                                                top: 0,
                                                left: 0,
                                                bottom: 0,
                                                right: 0,
                                                position: 'absolute',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Typography variant="h4" component="div" color="text.secondary">
                                                {`${schoolStats.attendanceRate}%`}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="body2" color="textSecondary">
                                        School-wide student attendance rate
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={8}>
                                <Paper sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="h6" gutterBottom>
                                        Class-wise Attendance
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={classAttendanceData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="present" name="Present %" fill="#4caf50" />
                                            <Bar dataKey="absent" name="Absent %" fill="#f44336" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                )}
                
                {/* Performance Tab */}
                {tabValue === 1 && (
                    <Box sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="h6" gutterBottom>
                                        Class Average Performance
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={classPerformanceData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis domain={[0, 100]} />
                                            <Tooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="average"
                                                name="Average Score"
                                                stroke="#8884d8"
                                                activeDot={{ r: 8 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="h6" gutterBottom>
                                        Assignment Submission Status
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={assignmentData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="submitted" name="Submitted" fill="#4caf50" />
                                            <Bar dataKey="pending" name="Pending" fill="#ff9800" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                )}
                
                {/* Demographics Tab */}
                {tabValue === 2 && (
                    <Box sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={5}>
                                <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                                    <Typography variant="h6" gutterBottom>
                                        Student Gender Distribution
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={genderData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) =>
                                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                                }
                                            >
                                                {genderData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={genderColors[index % genderColors.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={7}>
                                <Paper sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="h6" gutterBottom>
                                        Class-wise Student Distribution
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart
                                            data={sclasses.map(sclass => ({
                                                name: sclass.sclassName,
                                                students: students.filter(s => s.sclassName?._id === sclass._id).length
                                            }))}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="students" name="Number of Students" fill="#3f51b5" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default AdminAnalytics;

