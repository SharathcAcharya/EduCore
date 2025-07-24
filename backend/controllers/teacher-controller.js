const bcrypt = require('bcrypt');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');

const teacherRegister = async (req, res) => {
    const { name, email, password, role, school, teachSubject, teachSclass } = req.body;
    try {
        console.log("Teacher registration request received:", { name, email, role, school, teachSubject, teachSclass });
        
        // Validate required fields
        if (!name || !email || !password || !role || !school || !teachSubject || !teachSclass) {
            console.log("Missing required fields:", { 
                name: !!name, 
                email: !!email, 
                password: !!password, 
                role: !!role,
                school: !!school,
                teachSubject: !!teachSubject,
                teachSclass: !!teachSclass
            });
            return res.status(400).json({ message: "All fields are required" });
        }
        
        // Check for existing teacher with same email
        const existingTeacherByEmail = await Teacher.findOne({ email });
        if (existingTeacherByEmail) {
            console.log("Teacher with email already exists:", email);
            return res.status(409).json({ message: 'Email already exists' });
        }
        
        // Check if subject exists
        const subject = await Subject.findById(teachSubject);
        if (!subject) {
            console.log("Subject not found:", teachSubject);
            return res.status(404).json({ message: "Subject not found" });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        // Create new teacher
        const teacher = new Teacher({ 
            name, 
            email, 
            password: hashedPass, 
            role, 
            school, 
            teachSubject, 
            teachSclass 
        });

        // Save teacher and update subject
        const result = await teacher.save();
        await Subject.findByIdAndUpdate(teachSubject, { teacher: teacher._id });
        
        // Remove password from response
        result.password = undefined;
        console.log("Teacher registered successfully:", result._id);
        
        res.status(201).json(result);
    } catch (err) {
        console.error("Error in teacher registration:", err);
        res.status(500).json({ 
            message: err.message || "An error occurred during teacher registration",
            error: err.toString()
        });
    }
};

const teacherLogIn = async (req, res) => {
    try {
        let teacher = await Teacher.findOne({ email: req.body.email });
        if (teacher) {
            const validated = await bcrypt.compare(req.body.password, teacher.password);
            if (validated) {
                teacher = await teacher.populate("teachSubject", "subName sessions")
                teacher = await teacher.populate("school", "schoolName")
                teacher = await teacher.populate("teachSclass", "sclassName")
                teacher.password = undefined;
                res.send(teacher);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "Teacher not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getTeachers = async (req, res) => {
    try {
        let teachers = await Teacher.find({ school: req.params.id })
            .populate("teachSubject", "subName")
            .populate("teachSclass", "sclassName");
        if (teachers.length > 0) {
            let modifiedTeachers = teachers.map((teacher) => {
                return { ...teacher._doc, password: undefined };
            });
            res.send(modifiedTeachers);
        } else {
            res.send({ message: "No teachers found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getTeacherDetail = async (req, res) => {
    try {
        let teacher = await Teacher.findById(req.params.id)
            .populate("teachSubject", "subName sessions")
            .populate("school", "schoolName")
            .populate("teachSclass", "sclassName")
        if (teacher) {
            teacher.password = undefined;
            res.send(teacher);
        }
        else {
            res.send({ message: "No teacher found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const updateTeacherSubject = async (req, res) => {
    const { teacherId, teachSubject } = req.body;
    try {
        console.log(`Updating teacher ${teacherId} with subject ${teachSubject}`);
        
        // Validate required parameters
        if (!teacherId || !teachSubject) {
            return res.status(400).json({ message: "Teacher ID and Subject ID are required" });
        }
        
        // Check if teacher exists
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        
        // Check if subject exists
        const subject = await Subject.findById(teachSubject);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacherId,
            { teachSubject },
            { new: true }
        );

        await Subject.findByIdAndUpdate(teachSubject, { teacher: updatedTeacher._id });

        console.log(`Successfully updated teacher ${teacherId} with subject ${teachSubject}`);
        res.status(200).json(updatedTeacher);
    } catch (error) {
        console.error("Error in updateTeacherSubject:", error);
        res.status(500).json({ 
            message: error.message || "An error occurred while updating teacher subject",
            error: error.toString() 
        });
    }
};

const deleteTeacher = async (req, res) => {
    try {
        console.log(`Deleting teacher with ID: ${req.params.id}`);
        
        const teacherId = req.params.id;
        if (!teacherId) {
            return res.status(400).json({ message: "Teacher ID is required" });
        }
        
        const deletedTeacher = await Teacher.findByIdAndDelete(teacherId);
        
        if (!deletedTeacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        
        console.log("Teacher deleted, updating subject references...");
        
        // Update subjects to remove teacher references
        await Subject.updateMany(
            { teacher: deletedTeacher._id, teacher: { $exists: true } },
            { $unset: { teacher: 1 } }
        );
        
        console.log("Teacher deletion complete");
        res.status(200).json(deletedTeacher);
    } catch (error) {
        console.error("Error deleting teacher:", error);
        res.status(500).json({ 
            message: "Failed to delete teacher", 
            error: error.message 
        });
    }
};

const deleteTeachers = async (req, res) => {
    try {
        console.log(`Deleting all teachers for school ID: ${req.params.id}`);
        
        const deletionResult = await Teacher.deleteMany({ school: req.params.id });
        const deletedCount = deletionResult.deletedCount || 0;

        if (deletedCount === 0) {
            return res.status(404).json({ message: "No teachers found to delete" });
        }

        // Find the deleted teachers to get their IDs for subject updates
        const deletedTeachers = await Teacher.find({ school: req.params.id });

        // Update subjects to remove teacher references
        await Subject.updateMany(
            { teacher: { $in: deletedTeachers.map(teacher => teacher._id) }, teacher: { $exists: true } },
            { $unset: { teacher: 1 } }
        );

        console.log(`Successfully deleted ${deletedCount} teachers`);
        res.status(200).json({ 
            message: `${deletedCount} teachers deleted successfully`,
            deletedCount 
        });
    } catch (error) {
        console.error("Error deleting teachers:", error);
        res.status(500).json({ 
            message: "Failed to delete teachers", 
            error: error.message 
        });
    }
};

const deleteTeachersByClass = async (req, res) => {
    try {
        const deletionResult = await Teacher.deleteMany({ sclassName: req.params.id });

        const deletedCount = deletionResult.deletedCount || 0;

        if (deletedCount === 0) {
            res.send({ message: "No teachers found to delete" });
            return;
        }

        const deletedTeachers = await Teacher.find({ sclassName: req.params.id });

        await Subject.updateMany(
            { teacher: { $in: deletedTeachers.map(teacher => teacher._id) }, teacher: { $exists: true } },
            { $unset: { teacher: "" }, $unset: { teacher: null } }
        );

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

const teacherAttendance = async (req, res) => {
    const { status, date } = req.body;

    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.send({ message: 'Teacher not found' });
        }

        const existingAttendance = teacher.attendance.find(
            (a) =>
                a.date.toDateString() === new Date(date).toDateString()
        );

        if (existingAttendance) {
            existingAttendance.status = status;
        } else {
            teacher.attendance.push({ date, status });
        }

        const result = await teacher.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error)
    }
};

module.exports = {
    teacherRegister,
    teacherLogIn,
    getTeachers,
    getTeacherDetail,
    updateTeacherSubject,
    deleteTeacher,
    deleteTeachers,
    deleteTeachersByClass,
    teacherAttendance
};