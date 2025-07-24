const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        model: {
            type: String,
            enum: ['admin', 'teacher', 'student'],
            required: true
        },
        name: {
            type: String,
            required: true
        }
    },
    receiver: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        model: {
            type: String,
            enum: ['admin', 'teacher', 'student', 'all_teachers', 'all_students', 'all'],
            required: true
        },
        name: {
            type: String,
            required: true
        }
    },
    subject: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    encryptedContent: {
        type: String
    },
    isEncrypted: {
        type: Boolean,
        default: true
    },
    attachment: {
        type: String,
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isBroadcast: {
        type: Boolean,
        default: false
    },
    chatRoomId: {
        type: String
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model("message", messageSchema);
