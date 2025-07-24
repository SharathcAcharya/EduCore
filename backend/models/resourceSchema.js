const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    resourceType: {
        type: String,
        enum: ['Document', 'Video', 'Link', 'Image', 'Other'],
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    sclassName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'uploaderModel',
        required: true
    },
    uploaderModel: {
        type: String,
        required: true,
        enum: ['admin', 'teacher']
    }
}, { timestamps: true });

module.exports = mongoose.model("resource", resourceSchema);
