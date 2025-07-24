import { createSlice } from '@reduxjs/toolkit';

const adminSlice = createSlice({
    name: 'admin',
    initialState: {
        admins: [],
        admin: null,
        loading: false,
        error: null,
        response: null,
    },
    reducers: {
        getRequest: (state) => {
            state.loading = true;
        },
        getSuccess: (state, action) => {
            state.admins = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        getFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        adminDone: (state, action) => {
            state.loading = false;
            state.error = null;
            state.admin = action.payload;
            state.response = null;
        }
    },
});

export const {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    adminDone
} = adminSlice.actions;

export default adminSlice.reducer;
