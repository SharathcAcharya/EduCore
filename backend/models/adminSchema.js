const mongoose = require("mongoose")

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "Admin"
    },
    schoolName: {
        type: String,
        unique: true,
        required: true
    }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Add a virtual property to use _id as school when needed
adminSchema.virtual('school').get(function() {
    return this._id;
});

module.exports = mongoose.model("admin", adminSchema)