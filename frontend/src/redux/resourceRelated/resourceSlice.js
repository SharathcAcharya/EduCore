import { createSlice } from "@reduxjs/toolkit";

const resourceSlice = createSlice({
    name: 'resource',
    initialState: {
        resources: [],
        loading: false,
        error: null,
        response: null,
    },
    reducers: {
        getResourcesStart: (state) => {
            state.loading = true;
        },
        getResourcesSuccess: (state, action) => {
            state.resources = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        getResourcesFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload ? action.payload.message : 'Failed to fetch resources';
            state.resources = [];
        },
        createResourceStart: (state) => {
            state.loading = true;
        },
        createResourceSuccess: (state, action) => {
            state.resources.push(action.payload);
            state.loading = false;
            state.error = null;
            state.response = action.payload;
        },
        createResourceFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        updateResourceStart: (state) => {
            state.loading = true;
        },
        updateResourceSuccess: (state, action) => {
            state.resources = state.resources.map((resource) =>
                resource._id === action.payload._id ? action.payload : resource
            );
            state.loading = false;
            state.error = null;
            state.response = action.payload;
        },
        updateResourceFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        deleteResourceStart: (state) => {
            state.loading = true;
        },
        deleteResourceSuccess: (state, action) => {
            state.resources = state.resources.filter((resource) => resource._id !== action.payload);
            state.loading = false;
            state.error = null;
            state.response = action.payload;
        },
        deleteResourceFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    },
});

export const {
    getResourcesStart, getResourcesSuccess, getResourcesFailed,
    createResourceStart, createResourceSuccess, createResourceFailed,
    updateResourceStart, updateResourceSuccess, updateResourceFailed,
    deleteResourceStart, deleteResourceSuccess, deleteResourceFailed
} = resourceSlice.actions;

export default resourceSlice.reducer;
