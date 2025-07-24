import { createSlice } from '@reduxjs/toolkit';
import { 
    getAllSubjects, 
    addSubject, 
    deleteSubject, 
    getSubjectsByClass 
} from './subjectHandle';

const subjectSlice = createSlice({
    name: 'subject',
    initialState: {
        subjects: [],
        loading: false,
        error: null,
        response: null,
    },
    reducers: {
        // Additional reducers if needed
    },
    extraReducers: (builder) => {
        builder
            // Get all subjects
            .addCase(getAllSubjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllSubjects.fulfilled, (state, action) => {
                state.loading = false;
                state.subjects = action.payload;
            })
            .addCase(getAllSubjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add subject
            .addCase(addSubject.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addSubject.fulfilled, (state, action) => {
                state.loading = false;
                state.subjects.push(action.payload);
                state.response = action.payload;
            })
            .addCase(addSubject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete subject
            .addCase(deleteSubject.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteSubject.fulfilled, (state, action) => {
                state.loading = false;
                state.subjects = state.subjects.filter(
                    (subject) => subject._id !== action.payload.id
                );
                state.response = action.payload;
            })
            .addCase(deleteSubject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get subjects by class
            .addCase(getSubjectsByClass.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getSubjectsByClass.fulfilled, (state, action) => {
                state.loading = false;
                state.subjects = action.payload;
            })
            .addCase(getSubjectsByClass.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default subjectSlice.reducer;
