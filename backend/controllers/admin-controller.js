const bcrypt = require('bcrypt');
const Admin = require('../models/adminSchema.js');
const Sclass = require('../models/sclassSchema.js');
const Student = require('../models/studentSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');
const Notice = require('../models/noticeSchema.js');
const Complain = require('../models/complainSchema.js');

const adminRegister = async (req, res) => {
    try {
        const { email, schoolName, password, name } = req.body;

        // Validate required fields
        if (!email || !schoolName || !password || !name) {
            return res.status(400).send({ 
                message: 'Missing required fields: All fields are required' 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const existingAdminByEmail = await Admin.findOne({ email });
        const existingSchool = await Admin.findOne({ schoolName });

        if (existingAdminByEmail) {
            return res.status(409).send({ message: 'Email already exists' });
        }
        if (existingSchool) {
            return res.status(409).send({ message: 'School name already exists' });
        }

        const admin = new Admin({
            name,
            email,
            schoolName,
            password: hashedPass,
            role: 'Admin'
        });

        const savedAdmin = await admin.save();
        // Convert to object and add virtual fields
        const adminData = savedAdmin.toObject({ getters: true, virtuals: true });
        // Remove sensitive data
        delete adminData.password;

        res.status(201).send(adminData);
    } catch (err) {
        console.error('Admin registration error:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

const adminLogIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send({ message: 'Email and password are required' });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).send({ message: 'Invalid email or password' });
        }

        const validated = await bcrypt.compare(password, admin.password);
        if (!validated) {
            return res.status(401).send({ message: 'Invalid email or password' });
        }

        // Convert to object and add virtual fields
        const adminData = admin.toObject({ getters: true, virtuals: true });
        delete adminData.password;

        res.send(adminData);
    } catch (err) {
        console.error('Admin login error:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

const getAdminDetail = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);
        if (!admin) {
            return res.status(404).send({ message: 'Admin not found' });
        }

        const adminData = admin.toObject({ getters: true, virtuals: true });
        delete adminData.password;

        res.send(adminData);
    } catch (err) {
        console.error('Get admin details error:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

const getAllAdmins = async (req, res) => {
    try {
        // Get the school id from request params
        const schoolId = req.params.id;
        
        // Validate school id
        if (!schoolId) {
            return res.status(400).send({ message: 'School ID is required' });
        }
        
        // Find all admins for this school
        // Since each school has only one admin, we're just returning that admin
        // along with a system admin if applicable
        const admin = await Admin.findById(schoolId);
        
        if (!admin) {
            return res.status(404).send({ message: 'Admin not found' });
        }
        
        // Convert to object and remove sensitive data
        const adminData = admin.toObject({ getters: true, virtuals: true });
        delete adminData.password;
        
        // Return as an array for consistency with other endpoints
        res.send([adminData]);
    } catch (err) {
        console.error('Get all admins error:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

module.exports = { adminRegister, adminLogIn, getAdminDetail, getAllAdmins };
