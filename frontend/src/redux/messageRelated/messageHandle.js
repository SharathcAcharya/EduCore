import axios from 'axios';
import { 
    getInboxStart, getInboxSuccess, getInboxFailed,
    getSentMessagesStart, getSentMessagesSuccess, getSentMessagesFailed,
    getMessageDetailStart, getMessageDetailSuccess, getMessageDetailFailed,
    getBroadcastMessagesStart, getBroadcastMessagesSuccess, getBroadcastMessagesFailed,
    getUnreadCountStart, getUnreadCountSuccess, getUnreadCountFailed,
    createMessageStart, createMessageSuccess, createMessageFailed,
    deleteMessageStart, deleteMessageSuccess, deleteMessageFailed
} from './messageSlice';
import { BASE_URL } from '../../config';
import { encryptMessage } from '../../utils/socketService';

export const getAllMessages = (userId, userModel, receiverId, receiverModel) => async (dispatch) => {
    dispatch(getMessageDetailStart());
    try {
        console.log(`Getting messages for ${userId} (${userModel}) with ${receiverId}`);
        
        // Use the Messages endpoint with user IDs
        const response = await axios.get(`${BASE_URL}/Messages/${userId}/${userModel}/${receiverId}`);
        
        if (response.status === 200) {
            dispatch(getMessageDetailSuccess(response.data));
            return response.data;
        } else {
            throw new Error(`Received unexpected status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error getting messages:', error);
        const serializedError = {
            message: error.response?.data?.message || error.message || 'An error occurred',
            status: error.response?.status
        };
        dispatch(getMessageDetailFailed(serializedError));
        return [];
    }
}

export const getInbox = (userId, userModel) => async (dispatch) => {
    dispatch(getInboxStart());
    try {
        const response = await axios.get(`${BASE_URL}/Inbox/${userId}/${userModel}`);
        dispatch(getInboxSuccess(response.data));
    } catch (error) {
        const serializedError = {
            message: error.response?.data?.message || error.message || 'An error occurred',
            status: error.response?.status
        };
        dispatch(getInboxFailed(serializedError));
    }
}

export const getSentMessages = (userId, userModel) => async (dispatch) => {
    dispatch(getSentMessagesStart());
    try {
        const response = await axios.get(`${BASE_URL}/SentMessages/${userId}/${userModel}`);
        dispatch(getSentMessagesSuccess(response.data));
    } catch (error) {
        const serializedError = {
            message: error.response?.data?.message || error.message || 'An error occurred',
            status: error.response?.status
        };
        dispatch(getSentMessagesFailed(serializedError));
    }
}

export const getBroadcastMessages = (userId, userModel) => async (dispatch) => {
    dispatch(getBroadcastMessagesStart());
    try {
        const response = await axios.get(`${BASE_URL}/BroadcastMessages/${userId}/${userModel}`);
        dispatch(getBroadcastMessagesSuccess(response.data));
    } catch (error) {
        const serializedError = {
            message: error.response?.data?.message || error.message || 'An error occurred',
            status: error.response?.status
        };
        dispatch(getBroadcastMessagesFailed(serializedError));
    }
}

export const getMessageDetail = (receiverId, senderId, senderModel) => async (dispatch) => {
    dispatch(getMessageDetailStart());
    try {
        console.log(`Getting message details: receiverId=${receiverId}, senderId=${senderId}, senderModel=${senderModel}`);
        
        // Skip API call for broadcast messages
        if (receiverId === 'broadcast') {
            console.log('Skipping message detail for broadcast type');
            dispatch(getMessageDetailSuccess([]));
            return [];
        }
        
        // Check if we're getting a specific message by ID or a conversation
        // Simple ObjectId validation - 24 character hex string
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(receiverId);
        let response;
        
        if (isValidObjectId) {
            // Try the single message endpoint first
            try {
                console.log(`Attempting to fetch single message with ID: ${receiverId}`);
                response = await axios.get(`${BASE_URL}/Message/${receiverId}`, {
                    params: { 
                        currentUserId: senderId, 
                        currentUserModel: senderModel,
                        senderModel: senderModel 
                    }
                });
                
                // If successful, return this message
                dispatch(getMessageDetailSuccess(response.data));
                return response.data;
            } catch (error) {
                // If it's a 404, we'll fall through to the conversation lookup
                if (error.response && error.response.status === 404) {
                    console.log('Message not found by ID, trying conversation lookup - this is normal behavior, not an error');
                    // Suppress the error in the console since this is expected fallback behavior
                    console.warn('404 Not Found for single message is expected; falling back to conversation lookup');
                } else {
                    // For any other error, rethrow it
                    throw error;
                }
            }
        }
        
        // Get conversation between users using the Messages endpoint
        console.log(`Getting conversation between ${senderId} (${senderModel}) and ${receiverId}`);
        response = await axios.get(`${BASE_URL}/Messages/${senderId}/${senderModel}/${receiverId}`);
        
        if (Array.isArray(response.data)) {
            dispatch(getMessageDetailSuccess(response.data));
            return response.data;
        } else {
            // If not an array, wrap it in an array to ensure consistent handling
            const messageArray = response.data ? [response.data] : [];
            dispatch(getMessageDetailSuccess(messageArray));
            return messageArray;
        }
    } catch (error) {
        const serializedError = {
            message: error.response?.data?.message || error.message || 'An error occurred',
            status: error.response?.status
        };
        console.error('Error in getMessageDetail:', serializedError);
        dispatch(getMessageDetailFailed(serializedError));
        
        // Return empty array instead of null to prevent further errors
        return [];
    }
}

export const getUnreadCount = (userId, userModel) => async (dispatch) => {
    dispatch(getUnreadCountStart());
    try {
        const response = await axios.get(`${BASE_URL}/UnreadCount/${userId}/${userModel}`);
        dispatch(getUnreadCountSuccess(response.data));
    } catch (error) {
        const serializedError = {
            message: error.response?.data?.message || error.message || 'An error occurred',
            status: error.response?.status
        };
        dispatch(getUnreadCountFailed(serializedError));
    }
}

export const sendMessage = (fields) => async (dispatch) => {
    dispatch(createMessageStart());
    try {
        console.log('Original message fields:', fields);
        
        // Ensure we have all required fields
        if (!fields.sender || !fields.receiver || !fields.subject || !fields.content || !fields.school) {
            throw new Error('Missing required message fields');
        }
        
        // Determine if this is a broadcast message
        const isBroadcast = ['all_teachers', 'all_students', 'all'].includes(
            fields.receiver.model
        );
        
        // Create a proper message structure with string IDs
        const messageData = {
            sender: {
                id: typeof fields.sender.id === 'object' ? fields.sender.id.toString() : fields.sender.id.toString(),
                model: fields.sender.model,
                name: fields.sender.name
            },
            receiver: {
                id: typeof fields.receiver.id === 'object' ? fields.receiver.id.toString() : fields.receiver.id.toString(),
                model: fields.receiver.model,
                name: fields.receiver.name
            },
            subject: fields.subject,
            content: fields.content,
            school: typeof fields.school === 'object' ? 
                (fields.school._id ? fields.school._id.toString() : fields.school.toString()) : 
                fields.school.toString(),
            timestamp: new Date().toISOString(),
            chatRoomId: fields.chatRoomId || '',
            isBroadcast
        };
        
        console.log('Sending message data:', messageData);
        
        const response = await axios.post(`${BASE_URL}/MessageCreate`, messageData);
        
        if (response.data && (response.status === 201 || response.status === 200)) {
            // Successfully created message
            dispatch(createMessageSuccess(response.data));
            
            // Return success with the message data
            return { success: true, data: response.data };
        } else {
            throw new Error('Unexpected response from server');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        
        const serializedError = {
            message: error.response?.data?.message || error.message || 'An error occurred',
            status: error.response?.status,
            details: error.response?.data?.details || {}
        };
        
        dispatch(createMessageFailed(serializedError));
        return { success: false, error: serializedError };
    }
}

export const deleteMessage = (id) => async (dispatch) => {
    dispatch(deleteMessageStart());
    try {
        await axios.delete(`${BASE_URL}/Message/${id}`);
        dispatch(deleteMessageSuccess(id));
        return { success: true };
    } catch (error) {
        const serializedError = {
            message: error.response?.data?.message || error.message || 'An error occurred',
            status: error.response?.status
        };
        dispatch(deleteMessageFailed(serializedError));
        return { success: false, error: serializedError };
    }
}
