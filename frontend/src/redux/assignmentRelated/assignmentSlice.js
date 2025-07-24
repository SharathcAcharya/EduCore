import { createSlice } from "@reduxjs/toolkit";

const assignmentSlice = createSlice({
    name: 'assignment',
    initialState: {
        assignments: [],
        currentAssignment: null,
        loading: false,
        error: null,
        response: null,
    },
    reducers: {
        getAssignmentsStart: (state) => {
            state.loading = true;
        },
        getAssignmentsSuccess: (state, action) => {
            state.assignments = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        getAssignmentsFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        getAssignmentDetailStart: (state) => {
            state.loading = true;
        },
        getAssignmentDetailSuccess: (state, action) => {
            state.currentAssignment = action.payload;
            state.loading = false;
            state.error = null;
        },
        getAssignmentDetailFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        createAssignmentStart: (state) => {
            state.loading = true;
        },
        createAssignmentSuccess: (state, action) => {
            state.assignments.push(action.payload);
            state.loading = false;
            state.error = null;
            state.response = action.payload;
        },
        createAssignmentFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        updateAssignmentStart: (state) => {
            state.loading = true;
        },
        updateAssignmentSuccess: (state, action) => {
            state.assignments = state.assignments.map((assignment) =>
                assignment._id === action.payload._id ? action.payload : assignment
            );
            state.loading = false;
            state.error = null;
            state.response = action.payload;
        },
        updateAssignmentFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        deleteAssignmentStart: (state) => {
            state.loading = true;
        },
        deleteAssignmentSuccess: (state, action) => {
            state.assignments = state.assignments.filter((assignment) => assignment._id !== action.payload);
            state.loading = false;
            state.error = null;
            state.response = action.payload;
        },
        deleteAssignmentFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        submitAssignmentStart: (state) => {
            state.loading = true;
        },
        submitAssignmentSuccess: (state, action) => {
            state.currentAssignment = action.payload;
            state.loading = false;
            state.error = null;
            state.response = action.payload;
        },
        submitAssignmentFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        gradeSubmissionStart: (state) => {
            state.loading = true;
        },
        gradeSubmissionSuccess: (state, action) => {
            state.currentAssignment = action.payload;
            state.loading = false;
            state.error = null;
            state.response = action.payload;
        },
        gradeSubmissionFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    },
});

export const {
    getAssignmentsStart, getAssignmentsSuccess, getAssignmentsFailed,
    getAssignmentDetailStart, getAssignmentDetailSuccess, getAssignmentDetailFailed,
    createAssignmentStart, createAssignmentSuccess, createAssignmentFailed,
    updateAssignmentStart, updateAssignmentSuccess, updateAssignmentFailed,
    deleteAssignmentStart, deleteAssignmentSuccess, deleteAssignmentFailed,
    submitAssignmentStart, submitAssignmentSuccess, submitAssignmentFailed,
    gradeSubmissionStart, gradeSubmissionSuccess, gradeSubmissionFailed
} = assignmentSlice.actions;

export default assignmentSlice.reducer;
