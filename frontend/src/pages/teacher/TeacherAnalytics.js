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
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem
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
    CalendarMonth,
    CheckCircle,
    AccessTime
} from '@mui/icons-material';
import CustomBarChart from '../../components/CustomBarChart';
import CustomPieChart from '../../components/CustomPieChart';

// Data transformation utilities
const calculateAttendancePercentage = (present, total) => {
    if (!total) return 0;
    return Math.round((present / total) * 100);
};

// Custom component for analytics cards
const StatCard = ({ icon, title, value, subtext, color }) => {
    const theme = useTheme();
    
    return (
        <Card 
            elevation={3} 
            sx={{ 
                height: '100%',
                borderLeft: `5px solid ${color || theme.palette.primary.main}`,
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }
            }}
        >
            <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                    {icon}
                    <Typography variant="h6" component="div" ml={1}>
                        {title}
                    </Typography>
                </Box>
                <Typography variant="h3" component="div" align="center" mt={2} mb={2} fontWeight="bold">
                    {value}
                </Typography>
                {subtext && (
                    <Typography variant="body2" color="text.secondary" align="center">
                        {subtext}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

// TabPanel component
function TabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`analytics-tabpanel-${index}`}
            aria-labelledby={`analytics-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

// Main component
const TeacherAnalytics = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const [tabValue, setTabValue] = useState(0);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [classStats, setClassStats] = useState({
        studentCount: 0,
        maleStudents: 0,
        femaleStudents: 0,
        subjectCount: 0,
        assignments: 0,
        completedAssignments: 0,
        attendanceRate: 0
    });
    const [loading, setLoading] = useState(true);

    // Sample data for demonstration
    const studentAttendanceData = [
        { studentName: 'John Smith', present: 42, absent: 3, total: 45, attendancePercentage: 93 },
        { studentName: 'Maria Garcia', present: 40, absent: 5, total: 45, attendancePercentage: 89 },
        { studentName: 'Ahmed Khan', present: 38, absent: 7, total: 45, attendancePercentage: 84 },
        { studentName: 'Li Wei', present: 45, absent: 0, total: 45, attendancePercentage: 100 },
        { studentName: 'Anna Nowak', present: 41, absent: 4, total: 45, attendancePercentage: 91 },
        { studentName: 'Carlos Gomez', present: 39, absent: 6, total: 45, attendancePercentage: 87 },
        { studentName: 'Emma Wilson', present: 43, absent: 2, total: 45, attendancePercentage: 96 },
        { studentName: 'David Chen', present: 37, absent: 8, total: 45, attendancePercentage: 82 },
    ];

    const subjectAttendanceData = [
        { subject: 'Mathematics', attendedClasses: 42, totalClasses: 45, attendancePercentage: 93 },
        { subject: 'Science', attendedClasses: 40, totalClasses: 45, attendancePercentage: 89 },
        { subject: 'English', attendedClasses: 38, totalClasses: 42, attendancePercentage: 90 },
        { subject: 'History', attendedClasses: 36, totalClasses: 40, attendancePercentage: 90 },
        { subject: 'Computer Science', attendedClasses: 44, totalClasses: 45, attendancePercentage: 98 },
    ];

    const assignmentCompletionData = [
        { assignment: 'Math Homework 1', submitted: 18, notSubmitted: 2, onTime: 15, late: 3 },
        { assignment: 'Science Project', submitted: 16, notSubmitted: 4, onTime: 12, late: 4 },
        { assignment: 'English Essay', submitted: 20, notSubmitted: 0, onTime: 18, late: 2 },
        { assignment: 'History Report', submitted: 15, notSubmitted: 5, onTime: 13, late: 2 },
        { assignment: 'CS Lab Exercise', submitted: 17, notSubmitted: 3, onTime: 16, late: 1 },
    ];

    const studentPerformanceData = [
        { student: 'John Smith', mathematics: 85, science: 92, english: 78, history: 88, computerScience: 95 },
        { student: 'Maria Garcia', mathematics: 92, science: 88, english: 90, history: 85, computerScience: 82 },
        { student: 'Ahmed Khan', mathematics: 78, science: 80, english: 85, history: 90, computerScience: 88 },
        { student: 'Li Wei', mathematics: 95, science: 93, english: 87, history: 82, computerScience: 96 },
        { student: 'Anna Nowak', mathematics: 88, science: 86, english: 92, history: 90, computerScience: 85 },
    ];

    const recentAssessmentData = [
        { assessment: 'Math Quiz 1', averageScore: 82, maxScore: 100, minScore: 65, passingRate: 90 },
        { assessment: 'Science Test', averageScore: 78, maxScore: 98, minScore: 60, passingRate: 85 },
        { assessment: 'English Exam', averageScore: 85, maxScore: 96, minScore: 70, passingRate: 95 },
        { assessment: 'History Quiz', averageScore: 80, maxScore: 95, minScore: 68, passingRate: 88 },
        { assessment: 'CS Project', averageScore: 90, maxScore: 100, minScore: 75, passingRate: 100 },
    ];

    // Load data on component mount
    useEffect(() => {
        if (currentUser?.school && currentUser?.teachSclass) {
            // Here we would dispatch actions to load data
            // For now, we're just simulating the loading
            setTimeout(() => {
                setClassStats({
                    studentCount: 20, // Mock data
                    maleStudents: 12, // Mock data
                    femaleStudents: 8, // Mock data
                    subjectCount: 5, // Mock data
                    assignments: 15, // Mock data
                    completedAssignments: 12, // Mock data
                    attendanceRate: 92, // Mock percentage
                });
                setLoading(false);
            }, 1000);
        }
    }, [currentUser, dispatch]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleSubjectChange = (event) => {
        setSelectedSubject(event.target.value);
    };

    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
    const genderColors = ['#2196f3', '#f50057'];

    // Gender data for pie chart
    const genderData = [
        { name: 'Male', value: classStats.maleStudents },
        { name: 'Female', value: classStats.femaleStudents }
    ];

    // Assignment data for pie chart
    const assignmentStatusData = [
        { name: 'Completed', value: classStats.completedAssignments },
        { name: 'Pending', value: classStats.assignments - classStats.completedAssignments }
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <BarChartIcon sx={{ mr: 1, fontSize: 32 }} />
                Class Analytics Dashboard
            </Typography>

            {/* Summary Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        icon={<Group color="primary" />}
                        title="Students"
                        value={classStats.studentCount}
                        color="#2196f3"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        icon={<MenuBook color="secondary" />}
                        title="Subjects"
                        value={classStats.subjectCount}
                        color="#f50057"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        icon={<Assignment color="warning" />}
                        title="Assignments"
                        value={classStats.assignments}
                        subtext={`${classStats.completedAssignments} completed`}
                        color="#ff9800"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        icon={<CheckCircle color="success" />}
                        title="Attendance"
                        value={`${classStats.attendanceRate}%`}
                        color="#4caf50"
                    />
                </Grid>
            </Grid>

            {/* Tab Navigation */}
            <Paper sx={{ mb: 4 }}>
                <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange} 
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab label="Attendance" />
                    <Tab label="Performance" />
                    <Tab label="Assignments" />
                </Tabs>

                {/* Attendance Tab */}
                <TabPanel value={tabValue} index={0}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                                <Typography variant="h6" gutterBottom>
                                    Overall Class Attendance
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                        <CircularProgress 
                                            variant="determinate" 
                                            value={classStats.attendanceRate} 
                                            size={200}
                                            thickness={5}
                                            color="primary"
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
                                            <Typography
                                                variant="h4"
                                                component="div"
                                            >{`${classStats.attendanceRate}%`}</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                                <Typography variant="h6" gutterBottom>
                                    Subject-wise Attendance
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={subjectAttendanceData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="subject" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="attendancePercentage" name="Attendance %" fill="#4caf50">
                                            {subjectAttendanceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper elevation={3} sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Student-wise Attendance
                                </Typography>
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart
                                        data={studentAttendanceData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        layout="vertical"
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" domain={[0, 100]} />
                                        <YAxis dataKey="studentName" type="category" width={150} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="attendancePercentage" name="Attendance %" fill="#4caf50" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                    </Grid>
                </TabPanel>

                {/* Performance Tab */}
                <TabPanel value={tabValue} index={1}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">
                                        Assessment Results
                                    </Typography>
                                    <FormControl sx={{ minWidth: 150 }} size="small">
                                        <InputLabel>Assessment</InputLabel>
                                        <Select
                                            value={selectedSubject}
                                            onChange={handleSubjectChange}
                                            label="Assessment"
                                        >
                                            <MenuItem value="">
                                                <em>All</em>
                                            </MenuItem>
                                            {recentAssessmentData.map((assessment, index) => (
                                                <MenuItem key={index} value={assessment.assessment}>
                                                    {assessment.assessment}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={recentAssessmentData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="assessment" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="averageScore" name="Average Score" fill="#8884d8" />
                                        <Bar dataKey="maxScore" name="Max Score" fill="#82ca9d" />
                                        <Bar dataKey="minScore" name="Min Score" fill="#ff8042" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                                <Typography variant="h6" gutterBottom>
                                    Student Gender Distribution
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={genderData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {genderData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={genderColors[index % genderColors.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [value, 'Students']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                        {genderData.map((entry, index) => (
                                            <Box key={`legend-${index}`} sx={{ display: 'flex', alignItems: 'center', mx: 2 }}>
                                                <Box 
                                                    component="span" 
                                                    sx={{ 
                                                        display: 'inline-block',
                                                        width: 16,
                                                        height: 16,
                                                        backgroundColor: genderColors[index % genderColors.length],
                                                        mr: 1
                                                    }} 
                                                />
                                                <Typography variant="body2">{entry.name}: {entry.value}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper elevation={3} sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Student Subject Performance
                                </Typography>
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart
                                        data={studentPerformanceData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="student" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="mathematics" name="Mathematics" fill="#8884d8" />
                                        <Bar dataKey="science" name="Science" fill="#82ca9d" />
                                        <Bar dataKey="english" name="English" fill="#ffc658" />
                                        <Bar dataKey="history" name="History" fill="#ff8042" />
                                        <Bar dataKey="computerScience" name="Computer Science" fill="#0088fe" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                    </Grid>
                </TabPanel>

                {/* Assignments Tab */}
                <TabPanel value={tabValue} index={2}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                                <Typography variant="h6" gutterBottom>
                                    Assignment Completion Status
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={assignmentStatusData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                <Cell fill="#4caf50" />
                                                <Cell fill="#ff9800" />
                                            </Pie>
                                            <Tooltip formatter={(value) => [value, 'Assignments']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mx: 2 }}>
                                            <Box 
                                                component="span" 
                                                sx={{ 
                                                    display: 'inline-block',
                                                    width: 16,
                                                    height: 16,
                                                    backgroundColor: '#4caf50',
                                                    mr: 1
                                                }} 
                                            />
                                            <Typography variant="body2">Completed: {classStats.completedAssignments}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mx: 2 }}>
                                            <Box 
                                                component="span" 
                                                sx={{ 
                                                    display: 'inline-block',
                                                    width: 16,
                                                    height: 16,
                                                    backgroundColor: '#ff9800',
                                                    mr: 1
                                                }} 
                                            />
                                            <Typography variant="body2">Pending: {classStats.assignments - classStats.completedAssignments}</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                                <Typography variant="h6" gutterBottom>
                                    Assignment Submission Timeliness
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={assignmentCompletionData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="assignment" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="onTime" name="On Time" stackId="a" fill="#4caf50" />
                                        <Bar dataKey="late" name="Late" stackId="a" fill="#ff9800" />
                                        <Bar dataKey="notSubmitted" name="Not Submitted" stackId="a" fill="#f44336" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                    </Grid>
                </TabPanel>
            </Paper>
        </Box>
    );
};

export default TeacherAnalytics;
