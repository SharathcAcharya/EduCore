// This script tests the Socket.IO connection between frontend and backend
// Run this in your browser console to debug connection issues

function testSocketConnection() {
    console.log('Testing Socket.IO connection...');
    
    // Import required dependencies
    const socketUrl = new URL(window.location.origin);
    const backendUrl = socketUrl.protocol + '//' + socketUrl.hostname + ':5000';
    
    console.log('Attempting to connect to backend at:', backendUrl);
    
    // Try to establish a connection
    const socket = io(backendUrl, {
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling']
    });
    
    // Connection events
    socket.on('connect', () => {
        console.log('✅ Connected successfully!');
        console.log('Socket ID:', socket.id);
        console.log('Connection state:', socket.connected ? 'Connected' : 'Disconnected');
        
        // Try joining a test room
        const testRoomId = 'test_room_' + Date.now();
        console.log('Attempting to join room:', testRoomId);
        socket.emit('join_chat', testRoomId);
    });
    
    socket.on('room_joined', (data) => {
        console.log('✅ Room joined successfully:', data);
    });
    
    socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        console.log('Possible issues:');
        console.log('1. Backend server not running');
        console.log('2. CORS configuration issue');
        console.log('3. Network connectivity problems');
        console.log('4. Port access restrictions');
    });
    
    socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
    });
    
    // Return the socket for further testing
    return socket;
}

// Execute the test
const testSocket = testSocketConnection();

// Cleanup function
function cleanupSocketTest() {
    if (testSocket && testSocket.connected) {
        console.log('Disconnecting test socket...');
        testSocket.disconnect();
        console.log('Test socket disconnected');
    }
}

// Instructions
console.log('\nTest instructions:');
console.log('1. Check the console for connection status');
console.log('2. If connection fails, verify backend is running');
console.log('3. To disconnect test socket, run: cleanupSocketTest()');
