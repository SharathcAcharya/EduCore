const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const app = express()
const Routes = require("./routes/route.js")
const { Server } = require("socket.io")
const http = require("http")

const PORT = process.env.PORT || 5000

dotenv.config();

// Enhanced CORS configuration
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
    credentials: true // Allow cookies
}))

app.use(express.json({ limit: '10mb' }))

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })    .then(console.log("Connected to MongoDB"))
    .catch((err) => console.log("NOT CONNECTED TO NETWORK", err))

// Mount routes with and without /api prefix for backward compatibility
app.use('/', Routes);
app.use('/api', Routes);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins
        methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
});

// Make io instance available to our routes
app.set('io', io);

// Socket.IO connection event
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Store user info if provided
    if (socket.handshake.auth && socket.handshake.auth.userId) {
        const userId = socket.handshake.auth.userId;
        const userRole = socket.handshake.auth.userRole;
        const schoolId = socket.handshake.auth.schoolId;
        
        console.log(`User ${userId} (${userRole}) from school ${schoolId} connected`);
        
        // Store user info in socket
        socket.userId = userId;
        socket.userRole = userRole;
        socket.schoolId = schoolId;
        
        // Auto-join appropriate role room
        if (userRole) {
            socket.join(userRole.toLowerCase());
            console.log(`User ${socket.id} auto-joined ${userRole.toLowerCase()} room`);
        }
    }

    // Join a chat room based on user IDs (sender_id + receiver_id)
    socket.on("join_chat", (chatRoomId) => {
        socket.join(chatRoomId);
        console.log(`User ${socket.id} joined room: ${chatRoomId}`);
        
        // Notify client that they've joined the room successfully
        socket.emit("room_joined", { roomId: chatRoomId, status: "success" });
    });

    // Join role-based room for broadcasts (admin, teacher, student)
    socket.on("join_role_room", (role) => {
        if (role && ['admin', 'teacher', 'student', 'teachers', 'students'].includes(role)) {
            socket.join(role);
            console.log(`User ${socket.id} joined ${role} room`);
            socket.emit("role_room_joined", { role, status: "success" });
        }
    });

    // Handle message sending
    socket.on("send_message", (messageData) => {
        console.log(`Message sent to room: ${messageData.chatRoomId}`, {
            sender: messageData.sender?.name,
            receiver: messageData.receiver?.name,
            subject: messageData.subject
        });
        
        // Broadcast to the specific room
        socket.to(messageData.chatRoomId).emit("receive_message", messageData);
    });

    // Handle broadcast message
    socket.on("send_broadcast", (broadcastData) => {
        const receiverType = broadcastData.receiverType;
        console.log(`Broadcast message sent to: ${receiverType}`, {
            sender: broadcastData.sender?.name,
            subject: broadcastData.subject
        });
        
        // Broadcast to the specified receiver type
        io.to(receiverType).emit("broadcast_message", broadcastData);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Function to try different ports if the default one is in use
const startServer = (port) => {
    server.listen(port, () => {
        console.log(`Server started at port no. ${port}`)
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is already in use, trying port ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('Error starting server:', err);
        }
    });
};

startServer(PORT);