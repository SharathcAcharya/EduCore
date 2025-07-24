import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
    name: 'message',
    initialState: {
        inbox: [],
        sentMessages: [],
        currentMessage: null,
        broadcastMessages: [],
        unreadCount: 0,
        loading: false,
        error: null,
        response: null,
    },
    reducers: {
        getInboxStart: (state) => {
            state.loading = true;
        },
        getInboxSuccess: (state, action) => {
            // Ensure inbox is always an array
            state.inbox = Array.isArray(action.payload) ? action.payload : [];
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        getInboxFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        getSentMessagesStart: (state) => {
            state.loading = true;
        },
        getSentMessagesSuccess: (state, action) => {
            // Ensure sentMessages is always an array
            state.sentMessages = Array.isArray(action.payload) ? action.payload : [];
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        getSentMessagesFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        getMessageDetailStart: (state) => {
            state.loading = true;
        },
        getMessageDetailSuccess: (state, action) => {
            // Handle both single message and array of messages
            state.currentMessage = action.payload;
            // If it's an array, ensure it's used as messages
            if (Array.isArray(action.payload) && action.payload.length === 0) {
                state.messages = [];
            } else if (Array.isArray(action.payload)) {
                state.messages = action.payload;
            }
            state.loading = false;
            state.error = null;
        },
        getMessageDetailFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        getBroadcastMessagesStart: (state) => {
            state.loading = true;
        },
        getBroadcastMessagesSuccess: (state, action) => {
            // Ensure broadcastMessages is always an array
            state.broadcastMessages = Array.isArray(action.payload) ? action.payload : [];
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        getBroadcastMessagesFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        getUnreadCountStart: (state) => {
            state.loading = true;
        },
        getUnreadCountSuccess: (state, action) => {
            state.unreadCount = action.payload.unreadCount;
            state.loading = false;
            state.error = null;
        },
        getUnreadCountFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        createMessageStart: (state) => {
            state.loading = true;
        },
        createMessageSuccess: (state, action) => {
            // Ensure sentMessages is an array before using unshift
            if (!Array.isArray(state.sentMessages)) {
                state.sentMessages = [];
            }
            state.sentMessages.unshift(action.payload);
            state.loading = false;
            state.error = null;
            state.response = action.payload;
        },
        createMessageFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        // Handle new broadcast message
        receiveBroadcastMessage: (state, action) => {
            // Add to broadcastMessages if it's a broadcast
            if (action.payload.isBroadcast) {
                // Ensure broadcastMessages is an array
                if (!Array.isArray(state.broadcastMessages)) {
                    state.broadcastMessages = [];
                }
                
                // Check for duplicates before adding
                const isDuplicate = state.broadcastMessages.some(m => 
                    m._id === action.payload._id || 
                    (m.timestamp === action.payload.timestamp && 
                     m.sender.id === action.payload.sender.id &&
                     m.content === action.payload.content)
                );
                
                if (!isDuplicate) {
                    state.broadcastMessages.unshift(action.payload);
                }
            }
        },
        deleteMessageStart: (state) => {
            state.loading = true;
        },
        deleteMessageSuccess: (state, action) => {
            state.inbox = state.inbox.filter((message) => message._id !== action.payload);
            state.sentMessages = state.sentMessages.filter((message) => message._id !== action.payload);
            state.broadcastMessages = state.broadcastMessages.filter((message) => message._id !== action.payload);
            state.loading = false;
            state.error = null;
            state.response = action.payload;
        },
        deleteMessageFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    },
});

export const {
    getInboxStart, getInboxSuccess, getInboxFailed,
    getSentMessagesStart, getSentMessagesSuccess, getSentMessagesFailed,
    getMessageDetailStart, getMessageDetailSuccess, getMessageDetailFailed,
    getBroadcastMessagesStart, getBroadcastMessagesSuccess, getBroadcastMessagesFailed,
    getUnreadCountStart, getUnreadCountSuccess, getUnreadCountFailed,
    createMessageStart, createMessageSuccess, createMessageFailed,
    receiveBroadcastMessage,
    deleteMessageStart, deleteMessageSuccess, deleteMessageFailed
} = messageSlice.actions;

export default messageSlice.reducer;
