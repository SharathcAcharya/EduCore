// Admin account checker utility
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

// Get the MongoDB connection strings
const LOCAL_MONGO = 'mongodb://localhost:27017/school-management';

// Admin schema (simplified version of the actual schema)
const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "Admin" },
    schoolName: { type: String, required: true, unique: true }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Add the virtual 'school' property
adminSchema.virtual('school').get(function() {
    return this._id;
});

const Admin = mongoose.model('admin', adminSchema);

async function checkAdmins() {
    try {
        console.log('Connecting to local MongoDB...');
        await mongoose.connect(LOCAL_MONGO);
        console.log('Connected to local MongoDB');

        // List all admin accounts
        const admins = await Admin.find({});
        
        console.log(`\nFound ${admins.length} admin account(s):`);
        
        admins.forEach((admin, index) => {
            console.log(`\nAdmin #${index + 1}:`);
            console.log(`ID: ${admin._id}`);
            console.log(`Name: ${admin.name}`);
            console.log(`Email: ${admin.email}`);
            console.log(`School Name: ${admin.schoolName}`);
            console.log(`Role: ${admin.role}`);
        });
        
        if (admins.length === 0) {
            console.log('No admin accounts found in the database.');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nMongoDB connection closed');
    }
}

checkAdmins();
