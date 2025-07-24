const Message = require('../models/messageSchema.js');
const mongoose = require('mongoose');
const { encryptMessage, decryptMessage } = require('../utils/encryption.js');
const Admin = require('../models/adminSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Student = require('../models/studentSchema.js');

const createMessage = async (req, res) => {
    try {
        console.log('Received message data:', JSON.stringify(req.body, null, 2));
        
        // Validate the required fields
        const { sender, receiver, subject, content, school } = req.body;
        
        if (!sender || !receiver || !subject || !content || !school) {
            return res.status(400).json({ 
                message: "Missing required fields", 
                details: { 
                    sender: sender ? 'provided' : 'missing', 
                    receiver: receiver ? 'provided' : 'missing', 
                    subject: subject ? 'provided' : 'missing', 
                    content: content ? 'provided' : 'missing', 
                    school: school ? 'provided' : 'missing' 
                } 
            });
        }
        
        // Create a new message with data from request body
        const messageData = { ...req.body };
        
        // Encrypt the message content
        if (content) {
            messageData.encryptedContent = encryptMessage(content);
            messageData.isEncrypted = true;
        }

        // Check if this is a broadcast message
        const isBroadcast = ['all_teachers', 'all_students', 'all'].includes(receiver.model);
        messageData.isBroadcast = isBroadcast;
        
        // Safely convert string IDs to ObjectIds
        if (typeof messageData.sender === 'object' && messageData.sender.id) {
            try {
                if (mongoose.Types.ObjectId.isValid(messageData.sender.id)) {
                    messageData.sender.id = new mongoose.Types.ObjectId(messageData.sender.id);
                }
            } catch (err) {
                console.error('Error converting sender ID to ObjectId:', err);
            }
        }
        
        if (typeof messageData.receiver === 'object' && messageData.receiver.id) {
            try {
                if (mongoose.Types.ObjectId.isValid(messageData.receiver.id)) {
                    messageData.receiver.id = new mongoose.Types.ObjectId(messageData.receiver.id);
                }
            } catch (err) {
                console.error('Error converting receiver ID to ObjectId:', err);
            }
        }
        
        if (messageData.school) {
            try {
                if (mongoose.Types.ObjectId.isValid(messageData.school)) {
                    messageData.school = new mongoose.Types.ObjectId(messageData.school);
                }
            } catch (err) {
                console.error('Error converting school ID to ObjectId:', err);
            }
        }
        
        // Set timestamp if not provided
        if (!messageData.timestamp) {
            messageData.timestamp = new Date();
        }
        
        console.log('Processed message data:', JSON.stringify({
            ...messageData,
            encryptedContent: messageData.encryptedContent ? '[ENCRYPTED]' : undefined
        }, null, 2));

        // Handle broadcast messages - create a message for each recipient
        if (isBroadcast) {
            const results = [];
            
            // Get all recipients based on the receiver model
            let recipients = [];
            const schoolId = messageData.school;
            
            if (receiver.model === 'all_teachers' || receiver.model === 'all') {
                const teachers = await Teacher.find({ school: schoolId });
                recipients = recipients.concat(teachers.map(teacher => ({
                    id: teacher._id,
                    model: 'teacher',
                    name: teacher.name
                })));
            }
            
            if (receiver.model === 'all_students' || receiver.model === 'all') {
                const students = await Student.find({ school: schoolId });
                recipients = recipients.concat(students.map(student => ({
                    id: student._id,
                    model: 'student',
                    name: student.name
                })));
            }
            
            // Create a message for each recipient
            for (const recipient of recipients) {
                const individualMessage = {
                    ...messageData,
                    receiver: recipient,
                    isBroadcast: true
                };
                
                const message = new Message(individualMessage);
                const result = await message.save();
                results.push(result);
                
                // Emit message to individual recipient's room
                if (req.app.get('io')) {
                    const io = req.app.get('io');
                    const chatRoomId = createChatRoomId(sender.id, recipient.id);
                    io.to(chatRoomId).emit('receive_message', {
                        ...result.toObject(),
                        content: content, // Send decrypted content for immediate display
                        chatRoomId
                    });
                }
            }
            
            // Broadcast to all relevant users
            if (req.app.get('io')) {
                const io = req.app.get('io');
                const broadcastData = {
                    ...messageData,
                    content: content, // Send decrypted content for immediate display
                    timestamp: new Date(),
                    isBroadcast: true
                };
                
                // Broadcast to teachers
                if (receiver.model === 'all_teachers' || receiver.model === 'all') {
                    io.to('teachers').emit('broadcast_message', broadcastData);
                }
                
                // Broadcast to students
                if (receiver.model === 'all_students' || receiver.model === 'all') {
                    io.to('students').emit('broadcast_message', broadcastData);
                }
            }
            
            console.log(`Broadcast message sent to ${results.length} recipients`);
            res.status(201).json({
                message: `Broadcast message sent to ${results.length} recipients`,
                originalMessage: messageData,
                recipientCount: results.length
            });
        } else {
            // Regular one-to-one message
            const message = new Message(messageData);
            const result = await message.save();
            
            // If there's a Socket.IO instance available, emit a message event
            if (req.app.get('io')) {
                const io = req.app.get('io');
                if (result.chatRoomId) {
                    io.to(result.chatRoomId).emit('receive_message', {
                        ...result.toObject(),
                        content: content // Send decrypted content for immediate display
                    });
                } else {
                    // Create a consistent room ID by sorting and concatenating IDs
                    const chatRoomId = createChatRoomId(sender.id, receiver.id);
                    io.to(chatRoomId).emit('receive_message', {
                        ...result.toObject(),
                        content: content, // Send decrypted content for immediate display
                        chatRoomId
                    });
                }
            }
            
            console.log('Message created successfully:', result._id);
            res.status(201).json({
                ...result.toObject(),
                content: content // Return decrypted content in the response
            });
        }
    } catch (err) {
        console.error('Error creating message:', err);
        res.status(500).json({ 
            message: "Error creating message", 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

// Helper function to create a consistent chat room ID
const createChatRoomId = (senderId, receiverId) => {
    const ids = [senderId.toString(), receiverId.toString()].sort();
    return `${ids[0]}_${ids[1]}`;
};

// Helper function to decrypt message content
const decryptMessageContent = (message) => {
    if (message.isEncrypted && message.encryptedContent) {
        try {
            message.content = decryptMessage(message.encryptedContent);
        } catch (error) {
            console.error('Error decrypting message:', error);
            message.content = '[Decryption failed]';
        }
    }
    return message;
};

// Helper function to decrypt an array of messages
const decryptMessages = (messages) => {
    return messages.map(msg => {
        if (msg.isEncrypted && msg.encryptedContent) {
            const decryptedMsg = { ...msg.toObject ? msg.toObject() : msg };
            try {
                decryptedMsg.content = decryptMessage(msg.encryptedContent);
            } catch (error) {
                console.error('Error decrypting message:', error);
                decryptedMsg.content = '[Decryption failed]';
            }
            return decryptedMsg;
        }
        return msg;
    });
};

const getInbox = async (req, res) => {
    try {
        const { userId, userModel } = req.params;
        
        const messages = await Message.find({
            'receiver.id': userId,
            'receiver.model': userModel
        }).sort({ timestamp: -1 });

        // Decrypt message contents
        const decryptedMessages = decryptMessages(messages);
        
        // Always return an array, even when empty
        res.status(200).json(decryptedMessages);
    } catch (error) {
        console.error('Error getting inbox:', error);
        res.status(500).json({ 
            message: "Error retrieving inbox", 
            error: error.message 
        });
    }
};

const getSentMessages = async (req, res) => {
    try {
        const { userId, userModel } = req.params;
        
        const messages = await Message.find({
            'sender.id': userId,
            'sender.model': userModel
        }).sort({ timestamp: -1 });

        // Decrypt message contents
        const decryptedMessages = decryptMessages(messages);
        
        // Always return an array, even when empty
        res.status(200).json(decryptedMessages);
    } catch (error) {
        console.error('Error getting sent messages:', error);
        res.status(500).json({ 
            message: "Error retrieving sent messages", 
            error: error.message 
        });
    }
};

// Get messages between two users
const getMessages = async (req, res) => {
    try {
        const { userId, userModel, receiverId } = req.params;
        
        if (!userId || !userModel || !receiverId) {
            return res.status(400).json({ 
                message: "Missing required parameters", 
                details: { userId, userModel, receiverId } 
            });
        }
        
        console.log(`Getting messages between ${userId} (${userModel}) and ${receiverId}`);
        
        let userIdObj, receiverIdObj;
        
        try {
            userIdObj = mongoose.Types.ObjectId.isValid(userId) ? 
                new mongoose.Types.ObjectId(userId) : userId;
                
            receiverIdObj = mongoose.Types.ObjectId.isValid(receiverId) ? 
                new mongoose.Types.ObjectId(receiverId) : receiverId;
        } catch (err) {
            console.error(`Error converting IDs to ObjectIds: ${err.message}`);
            return res.status(400).json({ message: "Invalid ID format" });
        }
        
        // Find messages in both directions (sent and received)
        const messages = await Message.find({
            $or: [
                {
                    'sender.id': userIdObj,
                    'sender.model': userModel,
                    'receiver.id': receiverIdObj
                },
                {
                    'sender.id': receiverIdObj,
                    'receiver.id': userIdObj,
                    'receiver.model': userModel
                }
            ]
        }).sort({ timestamp: 1 });
        
        // Mark all unread messages as read
        const unreadMessages = messages.filter(msg => 
            !msg.isRead && 
            msg.receiver.id.toString() === userId && 
            msg.receiver.model === userModel
        );
        
        if (unreadMessages.length > 0) {
            try {
                await Promise.all(unreadMessages.map(msg => {
                    msg.isRead = true;
                    return msg.save();
                }));
                console.log(`Marked ${unreadMessages.length} messages as read`);
            } catch (err) {
                console.error('Error marking messages as read:', err);
            }
        }

        // Decrypt message contents
        const decryptedMessages = decryptMessages(messages);
        
        if (decryptedMessages.length > 0) {
            res.status(200).json(decryptedMessages);
        } else {
            res.status(200).json([]); // Return empty array instead of 404
        }
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ 
            message: "Error retrieving messages", 
            error: error.message 
        });
    }
};

// Get a single message by ID
const getMessageDetail = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ message: "Message ID is required" });
        }
        
        // Check if it's a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid message ID format" });
        }
        
        const message = await Message.findById(id);
        
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }
        
        // If the current user is the receiver, mark as read
        const currentUserId = req.query.currentUserId;
        const currentUserModel = req.query.currentUserModel;
        
        if (currentUserId && currentUserModel && 
            message.receiver.id.toString() === currentUserId && 
            message.receiver.model === currentUserModel && 
            !message.isRead) {
            
            message.isRead = true;
            await message.save();
        }

        // Decrypt message content
        const decryptedMessage = decryptMessageContent(message);
        
        res.status(200).json(decryptedMessage);
    } catch (error) {
        console.error("Error in getMessageDetail:", error);
        res.status(500).json({ message: "Error retrieving message", error: error.message });
    }
};

const deleteMessage = async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Message has been deleted" });
    } catch (error) {
        res.status(500).json(error);
    }
};

const getUnreadCount = async (req, res) => {
    try {
        const { userId, userModel } = req.params;
        
        const count = await Message.countDocuments({
            'receiver.id': userId,
            'receiver.model': userModel,
            isRead: false
        });
        
        res.status(200).json({ unreadCount: count });
    } catch (error) {
        res.status(500).json(error);
    }
};

// Get all broadcast messages for a user
const getBroadcastMessages = async (req, res) => {
    try {
        const { userId, userModel } = req.params;
        
        const messages = await Message.find({
            'receiver.id': userId,
            'receiver.model': userModel,
            isBroadcast: true
        }).sort({ timestamp: -1 });

        // Decrypt message contents
        const decryptedMessages = decryptMessages(messages);
        
        res.status(200).json(decryptedMessages);
    } catch (error) {
        console.error('Error getting broadcast messages:', error);
        res.status(500).json({ 
            message: "Error retrieving broadcast messages", 
            error: error.message 
        });
    }
};

module.exports = {
    createMessage,
    getInbox,
    getSentMessages,
    getMessageDetail,
    getMessages,
    deleteMessage,
    getUnreadCount,
    getBroadcastMessages
};
