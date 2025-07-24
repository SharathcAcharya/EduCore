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
    TextField,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    Assignment,
    DateRange,
    Subject,
    ArrowBack,
    CloudUpload,
    CheckCircle,
    TimerOff,
} from '@mui/icons-material';
import { 
    getAssignmentDetail, 
    submitAssignment
} from '../../redux/assignmentRelated/assignmentHandle';

const AssignmentSubmission = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { assignment, submission, loading, error } = useSelector((state) => state.assignment);

    const [comment, setComment] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);    useEffect(() => {
        if (id && currentUser?.school) {
            console.log("Fetching assignment details for submission, ID:", id);
            dispatch(getAssignmentDetail(id));
            // We'll get the submission from the assignment detail response
        }
    }, [dispatch, id, currentUser]);

    useEffect(() => {
        if (submission) {
            setComment(submission.comment || '');
            setFileUrl(submission.submissionFile || '');
        }
    }, [submission]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isSubmissionAllowed = () => {
        if (submission && (submission.status === 'Submitted' || submission.status === 'Late')) {
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!fileUrl) {
            setSubmitError('Please provide a link to your submission file');
            return;
        }

        setSubmitting(true);
        setSubmitError(null);
        
        try {
            const now = new Date();
            const dueDate = new Date(assignment.dueDate);
            const status = now > dueDate ? 'Late' : 'Submitted';
            
            const submissionData = {
                assignment: id,
                student: currentUser._id,
                submissionFile: fileUrl,
                comment,
                submissionDate: new Date().toISOString(),
                status,
            };            await dispatch(submitAssignment(id, submissionData));
            setSubmitSuccess(true);
            
            // Refresh assignment data to get updated submission
            dispatch(getAssignmentDetail(id));
        } catch (error) {
            setSubmitError(error.message || 'Failed to submit assignment');
        } finally {
            setSubmitting(false);
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
                    <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Chip 
                            label={`Max Marks: ${assignment.maxMarks}`} 
                            color="primary" 
                            sx={{ mr: 1 }} 
                        />
                        {submission ? (
                            <Chip 
                                icon={<CheckCircle />}
                                label={submission.status} 
                                color={submission.status === 'Late' ? 'warning' : 'success'} 
                            />
                        ) : (
                            <Chip 
                                icon={new Date(assignment.dueDate) < new Date() ? <TimerOff /> : null}
                                label={new Date(assignment.dueDate) < new Date() ? "Past Due" : getDaysLeft(assignment.dueDate)} 
                                color={new Date(assignment.dueDate) < new Date() ? "error" : "info"} 
                            />
                        )}
                    </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body1" paragraph>
                    {assignment.description}
                </Typography>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Subject fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="body2">
                                <strong>Subject:</strong> {assignment.subject && assignment.subject.subName}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <DateRange fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="body2">
                                <strong>Due Date:</strong> {formatDate(assignment.dueDate)}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    {submission ? 'Your Submission' : 'Submit Assignment'}
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {submission && submission.marks !== undefined && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            Graded: {submission.marks}/{assignment.maxMarks}
                        </Typography>
                        {submission.feedback && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                <strong>Feedback:</strong> {submission.feedback}
                            </Typography>
                        )}
                    </Alert>
                )}

                {submitSuccess && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        Assignment submitted successfully!
                    </Alert>
                )}

                {submitError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {submitError}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Submission Link (Google Drive, OneDrive, etc.)"
                                value={fileUrl}
                                onChange={(e) => setFileUrl(e.target.value)}
                                required
                                disabled={submission && !isSubmissionAllowed()}
                                helperText="Provide a shareable link to your assignment file"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Comments (Optional)"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                multiline
                                rows={4}
                                disabled={submission && !isSubmissionAllowed()}
                            />
                        </Grid>
                        
                        {submission ? (
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Submitted on: {formatDate(submission.submissionDate)}
                                    </Typography>
                                    {isSubmissionAllowed() && (
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            startIcon={<CloudUpload />}
                                            disabled={submitting}
                                        >
                                            {submitting ? 'Submitting...' : 'Update Submission'}
                                        </Button>
                                    )}
                                </Box>
                            </Grid>
                        ) : (
                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    startIcon={<CloudUpload />}
                                    disabled={submitting || (new Date(assignment.dueDate) < new Date() && !isSubmissionAllowed())}
                                >
                                    {submitting ? 'Submitting...' : new Date(assignment.dueDate) < new Date() ? 'Submit Late' : 'Submit Assignment'}
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default AssignmentSubmission;
