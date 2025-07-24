import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    status: 'idle',
    currentUser: null,
    currentRole: null,
    userDetails: [],
    response: null,
    error: null,
    isAuthenticated: false,
    schoolName: null,
    darkMode: false
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        authRequest: (state) => {
            state.status = 'loading';
            state.error = null;
            state.response = null;
        },
        
        underControl: (state) => {
            state.status = 'idle';
            state.error = null;
            state.response = null;
        },

        stuffAdded: (state) => {
            state.status = 'added';
            state.error = null;
            state.response = null;
        },        authSuccess: (state, action) => {
            state.status = 'success';
            state.currentUser = action.payload;
            state.currentRole = action.payload.role;
            state.isAuthenticated = true;
            state.error = null;
            state.response = null;

            // Add admin-specific data
            if (action.payload.role === 'Admin') {
                state.schoolName = action.payload.schoolName;
            }

            // Only store user in localStorage if rememberMe is true
            if (action.payload.rememberMe) {
                // Create a copy without the rememberMe flag for local storage
                const userToStore = { ...action.payload };
                delete userToStore.rememberMe;
                localStorage.setItem('user', JSON.stringify(userToStore));
            } else {
                // Make sure localStorage is cleared if not remembering
                localStorage.removeItem('user');
            }
        },

        authFailed: (state, action) => {
            state.status = 'failed';
            state.response = typeof action.payload === 'string' ? action.payload : action.payload.message;
            state.error = null;
            state.isAuthenticated = false;
        },

        authError: (state, action) => {
            state.status = 'error';
            state.error = action.payload;
            state.isAuthenticated = false;
            state.response = null;
        },

        authLogout: (state) => {
            localStorage.removeItem('user');
            state.currentUser = null;
            state.userDetails = [];
            state.status = 'idle';
            state.error = null;
            state.response = null;
            state.currentRole = null;
            state.isAuthenticated = false;
            state.schoolName = null;
        },

        doneSuccess: (state, action) => {
            state.userDetails = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
        },

        getDeleteSuccess: (state) => {
            state.loading = false;
            state.error = null;
            state.response = null;
        },

        getRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.response = null;
        },

        getFailed: (state, action) => {
            state.response = typeof action.payload === 'string' ? action.payload : action.payload.message;
            state.loading = false;
            state.error = null;
        },

        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.response = null;
        },

        toggleDarkMode: (state) => {
            state.darkMode = !state.darkMode;
        }
    },
});

export const {
    authRequest,
    underControl,
    stuffAdded,
    authSuccess,
    authFailed,
    authError,
    authLogout,
    doneSuccess,
    getDeleteSuccess,
    getRequest,
    getFailed,
    getError,
    toggleDarkMode
} = userSlice.actions;

export const userReducer = userSlice.reducer;
