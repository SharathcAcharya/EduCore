import { createSlice } from "@reduxjs/toolkit";

const eventSlice = createSlice({
    name: 'event',
    initialState: {
        events: [],
        loading: false,
        error: null,
        response: null,
    },
    reducers: {
        getEventsStart: (state) => {
            state.loading = true;
        },        getEventsSuccess: (state, action) => {
            // Handle both array responses and message objects
            if (Array.isArray(action.payload)) {
                console.log("Setting events array with", action.payload.length, "items");
                state.events = action.payload;
            } else if (action.payload && action.payload.message) {
                console.log("Received message object instead of events array:", action.payload);
                state.events = [];
                state.error = action.payload.message;
            } else {
                console.log("Received empty or invalid response for events");
                state.events = [];
            }
            state.loading = false;
            state.error = null;
            state.response = null;
        },        getEventsFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            // Set empty array to avoid rendering issues
            state.events = [];
        },
        createEventStart: (state) => {
            state.loading = true;
        },        createEventSuccess: (state, action) => {
            console.log("Adding new event to state:", action.payload);
            if (action.payload && action.payload._id) {
                // Check if event already exists in the array to avoid duplicates
                const existingIndex = state.events.findIndex(event => event._id === action.payload._id);
                
                if (existingIndex >= 0) {
                    // Update existing event
                    state.events[existingIndex] = action.payload;
                    console.log("Updated existing event in state");
                } else {
                    // Add new event
                    state.events.push(action.payload);
                    console.log("Added new event to state");
                }
            } else {
                console.warn("Received invalid event data:", action.payload);
            }
            state.loading = false;
            state.error = null;
            state.response = action.payload;
        },
        createEventFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        updateEventStart: (state) => {
            state.loading = true;
        },
        updateEventSuccess: (state, action) => {
            state.events = state.events.map((event) =>
                event._id === action.payload._id ? action.payload : event
            );
            state.loading = false;
            state.error = null;
            state.response = action.payload;
        },
        updateEventFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        deleteEventStart: (state) => {
            state.loading = true;
        },
        deleteEventSuccess: (state, action) => {
            state.events = state.events.filter((event) => event._id !== action.payload);
            state.loading = false;
            state.error = null;
            state.response = action.payload;
        },
        deleteEventFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    },
});

export const {
    getEventsStart, getEventsSuccess, getEventsFailed,
    createEventStart, createEventSuccess, createEventFailed,
    updateEventStart, updateEventSuccess, updateEventFailed,
    deleteEventStart, deleteEventSuccess, deleteEventFailed
} = eventSlice.actions;

export default eventSlice.reducer;
