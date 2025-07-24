import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    Divider,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    CircularProgress,
} from '@mui/material';
import {
    Assignment,
    School,
    Class,
    Subject,
    DateRange,
    Person,
    ArrowBack,
    Download,
} from '@mui/icons-material';
import { getAssignmentDetail } from '../../../redux/assignmentRelated/assignmentHandle';

const AssignmentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { assignment, submissions, loading, error } = useSelector((state) => state.assignment);    useEffect(() => {
        if (id && currentUser?.school) {
            dispatch(getAssignmentDetail(id));
        }
    }, [dispatch, id, currentUser]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getSubmissionStatusColor = (status) => {
        switch (status) {
            case 'Submitted':
                return '#4caf50'; // green
            case 'Late':
                return '#ff9800'; // orange
            case 'Not Submitted':
                return '#f44336'; // red
            case 'Graded':
                return '#2196f3'; // blue
            default:
                return '#9e9e9e'; // grey
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="error">{error}</Typography>
            </Paper>
        );
    }

    if (!assignment) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6">Assignment not found</Typography>
            </Paper>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ mb: 2 }}
            >
                Back to Assignments
            </Button>

            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <Assignment sx={{ mr: 1 }} />
                            {assignment.title}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Chip 
                            label={`Max Marks: ${assignment.maxMarks}`} 
                            color="primary" 
                            sx={{ mr: 1 }} 
                        />
                        <Chip 
                            label={new Date(assignment.dueDate) < new Date() ? "Past Due" : "Active"} 
                            color={new Date(assignment.dueDate) < new Date() ? "error" : "success"} 
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body1" paragraph>
                    {assignment.description}
                </Typography>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <School fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="body2">
                                <strong>Class:</strong> {assignment.sclassName && assignment.sclassName.className}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Subject fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="body2">
                                <strong>Subject:</strong> {assignment.subject && assignment.subject.subName}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <DateRange fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="body2">
                                <strong>Due Date:</strong> {formatDate(assignment.dueDate)}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>                            <Person fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="body2">
                                <strong>Assigned By:</strong> {assignment.assignedBy?.name || 'Admin'}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Student Submissions
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {submissions && submissions.length > 0 ? (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Student Name</strong></TableCell>
                                    <TableCell><strong>Roll No</strong></TableCell>
                                    <TableCell><strong>Submission Date</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                    <TableCell><strong>Marks</strong></TableCell>
                                    <TableCell><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {submissions.map((submission) => (
                                    <TableRow key={submission._id}>
                                        <TableCell>
                                            {submission.student && submission.student.name}
                                        </TableCell>
                                        <TableCell>
                                            {submission.student && submission.student.rollNum}
                                        </TableCell>
                                        <TableCell>
                                            {submission.submissionDate ? formatDate(submission.submissionDate) : 'Not Submitted'}
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={submission.status} 
                                                size="small" 
                                                sx={{ 
                                                    bgcolor: getSubmissionStatusColor(submission.status),
                                                    color: 'white'
                                                }} 
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {submission.marks !== undefined ? `${submission.marks}/${assignment.maxMarks}` : 'Not Graded'}
                                        </TableCell>
                                        <TableCell>
                                            {submission.submissionFile && (
                                                <IconButton 
                                                    color="primary"
                                                    href={submission.submissionFile}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Download />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
                        No submissions yet
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

export default AssignmentDetails;
