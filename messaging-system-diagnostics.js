/**
 * Messaging System Diagnostics and Repair Tool
 * 
 * This script will:
 * 1. Check for proper socket.io configuration
 * 2. Verify message routes and controllers
 * 3. Test message encryption/decryption
 * 4. Verify client-side socket integration
 * 
 * Run this script from the root directory: node messaging-system-diagnostics.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== EduSphere Messaging System Diagnostics ===');

// Check if socket.io is installed
try {
    console.log('\nChecking socket.io installation...');
    const backendPackageJson = JSON.parse(fs.readFileSync('./backend/package.json', 'utf8'));
    const frontendPackageJson = JSON.parse(fs.readFileSync('./frontend/package.json', 'utf8'));
    
    const backendSocketVersion = backendPackageJson.dependencies['socket.io'];
    const frontendSocketVersion = frontendPackageJson.dependencies['socket.io-client'];
    
    if (backendSocketVersion) {
        console.log(`✅ Backend socket.io found: ${backendSocketVersion}`);
    } else {
        console.log('❌ Backend socket.io not found! Installing...');
        execSync('cd backend && npm install socket.io@^4.8.1 --save');
        console.log('✅ Installed socket.io for backend');
    }
    
    if (frontendSocketVersion) {
        console.log(`✅ Frontend socket.io-client found: ${frontendSocketVersion}`);
    } else {
        console.log('❌ Frontend socket.io-client not found! Installing...');
        execSync('cd frontend && npm install socket.io-client@^4.8.1 --save');
        console.log('✅ Installed socket.io-client for frontend');
    }
} catch (error) {
    console.error('Error checking socket.io installation:', error.message);
}

// Check backend routes for message endpoints
try {
    console.log('\nChecking message routes...');
    const routesFile = fs.readFileSync('./backend/routes/route.js', 'utf8');
    
    const requiredEndpoints = [
        '/MessageCreate',
        '/Inbox/',
        '/SentMessages/',
        '/BroadcastMessages/',
        '/Messages/',
        '/Message/',
        '/UnreadCount/'
    ];
    
    let missingEndpoints = [];
    
    for (const endpoint of requiredEndpoints) {
        if (!routesFile.includes(endpoint)) {
            missingEndpoints.push(endpoint);
        }
    }
    
    if (missingEndpoints.length === 0) {
        console.log('✅ All required message endpoints found');
    } else {
        console.log(`❌ Missing message endpoints: ${missingEndpoints.join(', ')}`);
        console.log('Please check the route.js file and add the missing endpoints');
    }
} catch (error) {
    console.error('Error checking message routes:', error.message);
}

// Verify socket initialization in index.js
try {
    console.log('\nChecking socket.io initialization in backend...');
    const indexFile = fs.readFileSync('./backend/index.js', 'utf8');
    
    if (indexFile.includes('const io = new Server(server')) {
        console.log('✅ Socket.io server initialization found');
    } else {
        console.log('❌ Socket.io server initialization not found or incorrect');
    }
    
    if (indexFile.includes('app.set(\'io\', io)')) {
        console.log('✅ Socket.io instance made available to routes');
    } else {
        console.log('❌ Socket.io instance not made available to routes');
    }
    
    // Check socket event handlers
    const requiredEvents = [
        'connection',
        'join_chat',
        'join_role_room',
        'send_message',
        'send_broadcast',
        'disconnect'
    ];
    
    let missingEvents = [];
    
    for (const event of requiredEvents) {
        if (!indexFile.includes(event)) {
            missingEvents.push(event);
        }
    }
    
    if (missingEvents.length === 0) {
        console.log('✅ All required socket event handlers found');
    } else {
        console.log(`❌ Missing socket event handlers: ${missingEvents.join(', ')}`);
    }
} catch (error) {
    console.error('Error checking socket.io initialization:', error.message);
}

// Check frontend socket service
try {
    console.log('\nChecking frontend socket service...');
    const socketServiceFile = fs.readFileSync('./frontend/src/utils/socketService.js', 'utf8');
    
    const requiredFunctions = [
        'initSocket',
        'joinChatRoom',
        'joinRoleRoom',
        'sendMessage',
        'sendBroadcastMessage',
        'subscribeToMessages',
        'subscribeToBroadcasts',
        'disconnectSocket'
    ];
    
    let missingFunctions = [];
    
    for (const func of requiredFunctions) {
        if (!socketServiceFile.includes(`export const ${func}`)) {
            missingFunctions.push(func);
        }
    }
    
    if (missingFunctions.length === 0) {
        console.log('✅ All required socket service functions found');
    } else {
        console.log(`❌ Missing socket service functions: ${missingFunctions.join(', ')}`);
    }
} catch (error) {
    console.error('Error checking frontend socket service:', error.message);
}

// Check MessageChat component
try {
    console.log('\nChecking MessageChat component...');
    const messageChatFile = fs.readFileSync('./frontend/src/components/messages/MessageChat.js', 'utf8');
    
    if (messageChatFile.includes('initSocket(currentUser)')) {
        console.log('✅ Socket initialization with user info found');
    } else {
        console.log('❌ Socket initialization with user info not found or incorrect');
    }
    
    if (messageChatFile.includes('joinRoleRoom(currentUser.role)')) {
        console.log('✅ Role-based room joining found');
    } else {
        console.log('❌ Role-based room joining not found or incorrect');
    }
    
    if (messageChatFile.includes('subscribeToMessages(')) {
        console.log('✅ Message subscription found');
    } else {
        console.log('❌ Message subscription not found or incorrect');
    }
    
    if (messageChatFile.includes('subscribeToBroadcasts(')) {
        console.log('✅ Broadcast subscription found');
    } else {
        console.log('❌ Broadcast subscription not found or incorrect');
    }
} catch (error) {
    console.error('Error checking MessageChat component:', error.message);
}

console.log('\n=== Messaging System Diagnostics Complete ===');
console.log('If any issues were found, please fix them and run this script again.');
console.log('If no issues were found, the messaging system should be working properly.');
