import React from 'react';
import { 
    Grid, 
    TextField, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    Button,
    Alert 
} from '@mui/material';

/**
 * Event Form component for creating and editing events
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data state
 * @param {Function} props.handleFormChange - Handler for form field changes
 * @param {Function} props.handleSubmit - Handler for form submission
 * @param {Array} props.sclasses - Array of available class options
 * @param {String} props.formMode - Form mode ('add' or 'edit')
 * @param {Boolean} props.isSubmitting - Whether the form is submitting
 * @param {String} props.submitError - Error message to display if submission failed
 * @param {String} props.submitSuccess - Success message to display when submission succeeded
 */
const EventForm = ({ 
    formData, 
    handleFormChange, 
    handleSubmit, 
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
                        name="endDate"
                        label="End Date"
                        type="date"
                        value={formData.endDate instanceof Date 
                            ? formData.endDate.toISOString().split('T')[0]
                            : new Date(formData.endDate).toISOString().split('T')[0]}
                        onChange={handleFormChange}
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
                        disabled={isSubmitting || !formData.title || !formData.description || !formData.startDate || !formData.endDate}
                    >
                        {isSubmitting 
                            ? 'Saving...' 
                            : formMode === 'add' 
                                ? 'Add Event' 
                                : 'Update Event'
                        }
                    </Button>
                </Grid>
            </Grid>
        </form>
    );
};

export default EventForm;
