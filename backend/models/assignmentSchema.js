const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        required: true
    },
    sclassName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    maxMarks: {
        type: Number,
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher'
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'assignerModel',
        required: true
    },
    assignerModel: {
        type: String,
        required: true,
        enum: ['admin', 'teacher'],
        default: 'teacher'
    },
    assignedDate: {
        type: Date,
        default: Date.now
    },
    attachments: {
        type: String
    },
    submissions: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'student',
            required: true
        },
        submissionDate: {
            type: Date,
            default: Date.now
        },
        submissionFile: {
            type: String,
            required: true
        },
        marks: {
            type: Number,
            default: 0
        },
        feedback: {
            type: String
        },
        status: {
            type: String,
            enum: ['Submitted', 'Graded', 'Late'],
            default: 'Submitted'
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model("assignment", assignmentSchema);
