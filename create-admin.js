// Admin account creation utility
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

// Get the MongoDB connection strings
const MONGO_URI = process.env.MONGO_URI;
const LOCAL_MONGO = 'mongodb://localhost:27017/school-management';

if (!MONGO_URI) {
    console.log('No MongoDB connection string found in .env file, will try local MongoDB');
}

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

async function createAdmin() {
    try {
        // First try Atlas connection
        console.log('Trying to connect to MongoDB Atlas...');
        try {
            await mongoose.connect(MONGO_URI);
            console.log('Connected to MongoDB Atlas');
        } catch (atlasError) {
            console.log('Failed to connect to MongoDB Atlas:', atlasError.message);
            console.log('Trying to connect to local MongoDB...');
            
            try {
                await mongoose.connect(LOCAL_MONGO);
                console.log('Connected to local MongoDB');
            } catch (localError) {
                console.error('Failed to connect to local MongoDB:', localError.message);
                console.error('Could not connect to any MongoDB instance. Please make sure MongoDB is running.');
                return;
            }
        }

        // Admin details - USE THESE EXACT CREDENTIALS TO LOG IN
        const adminDetails = {
            name: 'SDM Admin',
            email: 'sdm@gmail.com',
            password: 'sdm@123',
            schoolName: 'SDM School'
        };

        // Check if admin with this email already exists
        const existingAdmin = await Admin.findOne({ email: adminDetails.email });
        
        if (existingAdmin) {
            console.log('Admin with this email already exists. Updating password...');
            
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash(adminDetails.password, salt);
            
            // Update the admin's password
            await Admin.updateOne(
                { email: adminDetails.email },
                { $set: { password: hashedPass } }
            );
            
            console.log('Admin password updated successfully');
        } else {
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash(adminDetails.password, salt);
            
            // Create a new admin
            const admin = new Admin({
                name: adminDetails.name,
                email: adminDetails.email,
                password: hashedPass,
                schoolName: adminDetails.schoolName,
                role: 'Admin'
            });
            
            await admin.save();
            console.log('New admin created successfully');
        }
        
        // Verify admin exists and can be retrieved
        const admin = await Admin.findOne({ email: adminDetails.email });
        
        if (admin) {
            console.log('Admin verified in database:');
            console.log({
                id: admin._id,
                name: admin.name,
                email: admin.email,
                schoolName: admin.schoolName
            });
            
            console.log('\n=====================================================');
            console.log('SUCCESS! You can now log in with these credentials:');
            console.log('Email: sdm@gmail.com');
            console.log('Password: sdm@123');
            console.log('=====================================================\n');
        } else {
            console.log('Failed to verify admin in database');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

createAdmin();
