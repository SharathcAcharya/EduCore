import { io } from 'socket.io-client';
import { BASE_URL } from '../config';
import CryptoJS from 'crypto-js';

// Secret key for encryption (in production, use environment variables)
// This is just a fallback default key
const DEFAULT_ENCRYPTION_KEY = 'edusphere_frontend_encryption_key_2025';

// Encrypt a message using AES encryption
const encryptMessage = (text, customKey = null) => {
    try {
        const key = customKey || DEFAULT_ENCRYPTION_KEY;
        return CryptoJS.AES.encrypt(text, key).toString();
    } catch (error) {
        console.error('Frontend encryption error:', error);
        return null;
    }
};

// Decrypt a message using AES encryption
const decryptMessage = (encryptedText, customKey = null) => {
    try {
        const key = customKey || DEFAULT_ENCRYPTION_KEY;
        const bytes = CryptoJS.AES.decrypt(encryptedText, key);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Frontend decryption error:', error);
        return '[Decryption failed]';
    }
};

// Extract the hostname and port from BASE_URL
const getSocketUrl = () => {
    try {
        const url = new URL(BASE_URL);
        return `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}`;
    } catch (error) {
        console.error('Error parsing BASE_URL:', error);
        return 'http://localhost:5000'; // Fallback to default
    }
};

// Initialize socket connection
let socket;

export const initSocket = (user = null) => {
    if (!socket) {
        const socketUrl = getSocketUrl();
        console.log('Initializing socket with URL:', socketUrl);
        
        const socketOptions = {
            transports: ['websocket', 'polling'],
            timeout: 10000,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        };

        // Add user info to socket connection if available
        if (user) {
            socketOptions.auth = {
                userId: user._id,
                userRole: user.role,
                schoolId: user.school
            };
        }
        
        socket = io(socketUrl, socketOptions);
        
        console.log('Socket initialized');
        
        socket.on('connect', () => {
            console.log('Socket connected with ID:', socket.id);
        });
        
        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
        });
        
        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected. Reason:', reason);
        });
    }
    
    return socket;
};

export const joinChatRoom = (senderId, receiverId) => {
    if (!socket) initSocket();
    
    if (!senderId || !receiverId) {
        console.error('joinChatRoom: Invalid IDs provided', { senderId, receiverId });
        return null;
    }
    
    // Create a consistent room ID by sorting and concatenating IDs
    const ids = [senderId, receiverId].sort();
    const roomId = `${ids[0]}_${ids[1]}`;
    
    console.log(`Joining chat room: ${roomId}`);
    socket.emit('join_chat', roomId);
    
    return roomId;
};

// Join role-specific room for broadcasts
export const joinRoleRoom = (role) => {
    if (!socket) initSocket();
    
    if (!role) {
        console.error('joinRoleRoom: No role provided');
        return false;
    }
    
    const roomName = role === 'teacher' ? 'teachers' : role === 'student' ? 'students' : role;
    
    console.log(`Joining role room: ${roomName}`);
    socket.emit('join_role_room', roomName);
    
    return true;
};

export const sendMessage = (messageData) => {
    if (!socket) initSocket();
    
    if (!socket.connected) {
        console.warn('Socket not connected. Message will be sent via API only.');
        return;
    }
    
    // Create a defensive copy to ensure we don't modify the original object
    // This handles Object.freeze, readonly properties, and Immutable.js objects
    try {
        // First create a deep copy in case the object is complex or nested    
        const defensiveCopy = JSON.parse(JSON.stringify(messageData));
        
        // Create a consistent room ID for the conversation
        if (defensiveCopy.sender && defensiveCopy.receiver) {
            const senderId = defensiveCopy.sender.id;
            const receiverId = defensiveCopy.receiver.id;
            
            if (!senderId || !receiverId) {
                console.error('sendMessage: Invalid IDs provided', { senderId, receiverId });
                return;
            }
            
            // Create a consistent room ID by sorting and concatenating IDs
            const ids = [senderId, receiverId].sort();
            const roomId = `${ids[0]}_${ids[1]}`;
            
            // Create a new message object with the chatRoomId rather than modifying the original
            const messageWithRoom = {
                ...defensiveCopy,
                chatRoomId: roomId
            };
            
            console.log(`Sending message to room: ${roomId}`, messageWithRoom);
            socket.emit('send_message', messageWithRoom);
        } else {
            console.error('sendMessage: Invalid message data structure', defensiveCopy);
        }
    } catch (error) {
        console.error('Error in socketService.sendMessage:', error);
    }
};

// Send a broadcast message to multiple recipients
export const sendBroadcastMessage = (broadcastData) => {
    if (!socket) initSocket();
    
    if (!socket.connected) {
        console.warn('Socket not connected. Broadcast will be sent via API only.');
        return;
    }
    
    try {
        const defensiveCopy = JSON.parse(JSON.stringify(broadcastData));
        
        // Determine the receiver type based on the receiver model
        let receiverType;
        if (defensiveCopy.receiver && defensiveCopy.receiver.model) {
            if (defensiveCopy.receiver.model === 'all_teachers') {
                receiverType = 'teachers';
            } else if (defensiveCopy.receiver.model === 'all_students') {
                receiverType = 'students';
            } else if (defensiveCopy.receiver.model === 'all') {
                receiverType = 'all';
            } else {
                receiverType = defensiveCopy.receiver.model + 's'; // pluralize
            }
        } else {
            console.error('sendBroadcastMessage: Invalid receiver model', defensiveCopy);
            return;
        }
        
        const broadcastWithType = {
            ...defensiveCopy,
            receiverType,
            isBroadcast: true
        };
        
        console.log(`Sending broadcast to: ${receiverType}`, broadcastWithType);
        socket.emit('send_broadcast', broadcastWithType);
    } catch (error) {
        console.error('Error in socketService.sendBroadcastMessage:', error);
    }
};

export const subscribeToMessages = (callback) => {
    if (!socket) initSocket();
    
    socket.on('receive_message', (message) => {
        callback(message);
    });
    
    return () => {
        if (socket) {
            socket.off('receive_message');
        }
    };
};

// Subscribe to broadcast messages
export const subscribeToBroadcasts = (callback) => {
    if (!socket) initSocket();
    
    socket.on('broadcast_message', (broadcastData) => {
        callback(broadcastData);
    });
    
    return () => {
        if (socket) {
            socket.off('broadcast_message');
        }
    };
};

export const disconnectSocket = () => {
    if (socket && socket.connected) {
        socket.disconnect();
        socket = null;
    }
};

export const debugSocketConnection = () => {
    if (!socket) {
        initSocket();
    }
    
    // Return connection status and relevant info
    return {
        isConnected: socket.connected,
        id: socket.id,
        url: socket.io.uri,
        reconnectionAttempts: socket.io.reconnectionAttempts,
        backoffDelay: socket.io.backoff.ms
    };
};

export { encryptMessage, decryptMessage };
