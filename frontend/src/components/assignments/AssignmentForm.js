import React from 'react';
import { 
    Grid, 
    TextField, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    Button,
    Alert,
    FormHelperText 
} from '@mui/material';

/**
 * Assignment Form component for creating and editing assignments
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data state
 * @param {Function} props.handleFormChange - Handler for form field changes
 * @param {Function} props.handleSubmit - Handler for form submission
 * @param {Array} props.subjects - Array of available subject options
 * @param {Array} props.sclasses - Array of available class options
 * @param {String} props.formMode - Form mode ('add' or 'edit')
 * @param {Boolean} props.isSubmitting - Whether the form is submitting
 * @param {String} props.submitError - Error message to display if submission failed
 * @param {String} props.submitSuccess - Success message to display when submission succeeded
 */
const AssignmentForm = ({ 
    formData, 
    handleFormChange, 
    handleSubmit, 
    subjects = [],
    sclasses = [],
    formMode = 'add',
    isSubmitting = false,
    submitError = null,
    submitSuccess = null
}) => {
    return (
        <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
                {submitError && (
                    <Grid item xs={12}>
                        <Alert severity="error">
                            {submitError}
                        </Alert>
                    </Grid>
                )}
                
                {submitSuccess && (
                    <Grid item xs={12}>
                        <Alert severity="success">
                            {submitSuccess}
                        </Alert>
                    </Grid>
                )}
                
                <Grid item xs={12}>
                    <TextField
                        name="title"
                        label="Assignment Title"
                        value={formData.title}
                        onChange={handleFormChange}
                        fullWidth
                        required
                    />
                </Grid>
                
                <Grid item xs={12}>
                    <TextField
                        name="description"
                        label="Assignment Description"
                        value={formData.description}
                        onChange={handleFormChange}
                        fullWidth
                        multiline
                        rows={4}
                        required
                    />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                        <InputLabel>Subject</InputLabel>
                        <Select
                            name="subject"
                            value={formData.subject}
                            onChange={handleFormChange}
                        >
                            {subjects && subjects.length > 0 ? (
                                subjects.map((subject) => (
                                    <MenuItem key={subject._id} value={subject._id}>
                                        {subject.subName}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>No subjects available</MenuItem>
                            )}
                        </Select>
                        <FormHelperText>Select the subject for this assignment</FormHelperText>
                    </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                        <InputLabel>Class</InputLabel>
                        <Select
                            name="sclassName"
                            value={formData.sclassName}
                            onChange={handleFormChange}
                        >
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
                        <FormHelperText>Select the class for this assignment</FormHelperText>
                    </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                    <TextField
                        name="dueDate"
                        label="Due Date"
                        type="date"
                        value={formData.dueDate instanceof Date 
                            ? formData.dueDate.toISOString().split('T')[0]
                            : formData.dueDate}
                        onChange={handleFormChange}
                        fullWidth
                        required
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                    <TextField
                        name="maxMarks"
                        label="Maximum Marks"
                        type="number"
                        value={formData.maxMarks}
                        onChange={handleFormChange}
                        fullWidth
                        required
                        inputProps={{ min: 1 }}
                    />
                </Grid>
                
                <Grid item xs={12}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={isSubmitting || !formData.title || !formData.description || !formData.subject || !formData.sclassName || !formData.dueDate}
                    >
                        {isSubmitting 
                            ? 'Saving...' 
                            : formMode === 'add' 
                                ? 'Add Assignment' 
                                : 'Update Assignment'
                        }
                    </Button>
                </Grid>
            </Grid>
        </form>
    );
};

export default AssignmentForm;
