const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    eventType: {
        type: String,
        enum: ['Holiday', 'Exam', 'Meeting', 'Activity', 'Other'],
        required: true
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
    createdBy: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("event", eventSchema);
