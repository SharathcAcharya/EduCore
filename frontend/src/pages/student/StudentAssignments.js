import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Paper,
    Divider,
    IconButton,
    Chip,
    Button,
    CircularProgress,
    TextField,
    InputAdornment,
} from '@mui/material';
import { 
    Assignment, 
    Search, 
    DateRange, 
    Subject, 
    ArrowForward,
    CheckCircle,
    Warning,
    TimerOff
} from '@mui/icons-material';
import { getClassAssignments } from '../../redux/assignmentRelated/assignmentHandle';

const StudentAssignments = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { assignments, loading, error } = useSelector((state) => state.assignment);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');    useEffect(() => {
        if (currentUser?.school && currentUser?.sclassName?._id) {
            console.log("Student fetching assignments for class:", currentUser.sclassName._id);
            dispatch(getClassAssignments(currentUser.school, currentUser.sclassName._id));
        } else {
            console.log("Missing school or class ID for student assignments");
        }
    }, [dispatch, currentUser]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusInfo = (assignment) => {
        const now = new Date();
        const dueDate = new Date(assignment.dueDate);
        const submission = assignment.submission;
        
        if (submission && submission.status === 'Submitted') {
            return {
                icon: <CheckCircle color="success" />,
                label: 'Submitted',
                color: '#4caf50',
                textColor: 'white',
                submittedOn: formatDate(submission.submissionDate)
            };
        } else if (submission && submission.status === 'Late') {
            return {
                icon: <Warning color="warning" />,
                label: 'Late Submission',
                color: '#ff9800',
                textColor: 'white',
                submittedOn: formatDate(submission.submissionDate)
            };
        } else if (dueDate < now) {
            return {
                icon: <TimerOff color="error" />,
                label: 'Past Due',
                color: '#f44336',
                textColor: 'white',
                submittedOn: null
            };
        } else {
            return {
                icon: <Assignment color="primary" />,
                label: 'Pending',
                color: '#2196f3',
                textColor: 'white',
                submittedOn: null
            };
        }
    };

    const getDaysLeft = (dueDate) => {
        const now = new Date();
        const due = new Date(dueDate);
        const diffTime = due - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return 'Past due';
        } else if (diffDays === 0) {
            return 'Due today';
        } else if (diffDays === 1) {
            return '1 day left';
        } else {
            return `${diffDays} days left`;
        }
    };

    const filteredAssignments = assignments && assignments.length > 0 
        ? assignments.filter(assignment => {
            const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 (assignment.subject && assignment.subject.subName.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const status = getStatusInfo(assignment).label;
            
            if (selectedStatus === 'all') {
                return matchesSearch;
            } else if (selectedStatus === 'submitted') {
                return matchesSearch && (status === 'Submitted' || status === 'Late Submission');
            } else if (selectedStatus === 'pending') {
                return matchesSearch && status === 'Pending';
            } else if (selectedStatus === 'past-due') {
                return matchesSearch && status === 'Past Due';
            }
            
            return matchesSearch;
        })
        : [];

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Assignment sx={{ mr: 1 }} />
                My Assignments
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search assignments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                            variant={selectedStatus === 'all' ? 'contained' : 'outlined'}
                            onClick={() => setSelectedStatus('all')}
                        >
                            All
                        </Button>
                        <Button 
                            variant={selectedStatus === 'pending' ? 'contained' : 'outlined'}
                            color="primary"
                            onClick={() => setSelectedStatus('pending')}
                        >
                            Pending
                        </Button>
                        <Button 
                            variant={selectedStatus === 'submitted' ? 'contained' : 'outlined'}
                            color="success"
                            onClick={() => setSelectedStatus('submitted')}
                        >
                            Submitted
                        </Button>
                        <Button 
                            variant={selectedStatus === 'past-due' ? 'contained' : 'outlined'}
                            color="error"
                            onClick={() => setSelectedStatus('past-due')}
                        >
                            Past Due
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" color="error">{error}</Typography>
                </Paper>
            ) : filteredAssignments.length > 0 ? (
                <Grid container spacing={3}>
                    {filteredAssignments.map((assignment) => {
                        const statusInfo = getStatusInfo(assignment);
                        return (
                            <Grid item xs={12} sm={6} md={4} key={assignment._id}>
                                <Card 
                                    elevation={3}
                                    sx={{ 
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'transform 0.2s',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                        }
                                    }}
                                    onClick={() => navigate(`/Student/assignments/${assignment._id}`)}
                                >
                                    <Box 
                                        sx={{ 
                                            p: 2, 
                                            display: 'flex', 
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                                        }}
                                    >                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {assignment.title}
                                        </Typography>
                                        <Box>
                                            {statusInfo.icon}
                                        </Box>
                                    </Box>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Subject fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                                                    <Typography variant="body2">
                                                        {assignment.subject && assignment.subject.subName}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <DateRange fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                                                    <Typography variant="body2">
                                                        Due: {formatDate(assignment.dueDate)}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            {statusInfo.submittedOn && (
                                                <Grid item xs={12}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Submitted on: {statusInfo.submittedOn}
                                                    </Typography>
                                                </Grid>
                                            )}
                                            {assignment.submission && assignment.submission.marks !== undefined && (
                                                <Grid item xs={12}>
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                        Marks: {assignment.submission.marks}/{assignment.maxMarks}
                                                    </Typography>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </CardContent>
                                    <Divider />
                                    <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Chip 
                                            label={statusInfo.label} 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: statusInfo.color,
                                                color: statusInfo.textColor
                                            }} 
                                        />
                                        {new Date(assignment.dueDate) > new Date() && (
                                            <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                                                {getDaysLeft(assignment.dueDate)}
                                            </Typography>
                                        )}
                                    </Box>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6">No Assignments Found</Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                        {selectedStatus !== 'all' 
                            ? `No ${selectedStatus} assignments found. Try a different filter.` 
                            : "There are no assignments for your class yet."}
                    </Typography>
                </Paper>
            )}
        </Box>
    );
};

export default StudentAssignments;
