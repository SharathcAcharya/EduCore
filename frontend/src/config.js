// This file contains common configuration settings for API calls

// Determine which base URL to use based on environment
export const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

// Constants for event types - for better consistency across the application
export const EVENT_TYPES = {
    HOLIDAY: 'Holiday',
    EXAM: 'Exam',
    MEETING: 'Meeting',
    ACTIVITY: 'Activity',
    OTHER: 'Other'
};

// Colors for event types
export const EVENT_TYPE_COLORS = {
    Holiday: '#4caf50',  // Green
    Exam: '#f44336',     // Red
    Meeting: '#2196f3',  // Blue
    Activity: '#9c27b0', // Purple
    Other: '#ff9800'     // Orange
};
