const Subject = require('../models/subjectSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Student = require('../models/studentSchema.js');

const subjectCreate = async (req, res) => {
    try {
        const subjects = req.body.subjects.map((subject) => ({
            subName: subject.subName,
            subCode: subject.subCode,
            sessions: subject.sessions,
        }));

        const existingSubjectBySubCode = await Subject.findOne({
            'subjects.subCode': subjects[0].subCode,
            school: req.body.adminID,
        });

        if (existingSubjectBySubCode) {
            res.send({ message: 'Sorry this subcode must be unique as it already exists' });
        } else {
            const newSubjects = subjects.map((subject) => ({
                ...subject,
                sclassName: req.body.sclassName,
                school: req.body.adminID,
            }));

            const result = await Subject.insertMany(newSubjects);
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const allSubjects = async (req, res) => {
    try {
        console.log("Fetching all subjects for school ID:", req.params.id);
        
        let subjects = await Subject.find({ school: req.params.id })
            .populate("sclassName", "sclassName");
        
        console.log(`Found ${subjects.length} subjects`);
        
        if (subjects.length > 0) {
            res.status(200).json(subjects);
        } else {
            // Return empty array for consistency instead of message object
            res.status(200).json([]);
        }
    } catch (err) {
        console.error("Error in allSubjects:", err);
        res.status(500).json({ message: err.message || "Error retrieving subjects" });
    }
};

const classSubjects = async (req, res) => {
    try {
        // Handle both route formats (/ClassSubjects/:id and /ClassSubjects/:schoolId/:classId)
        const classId = req.params.classId || req.params.id;
        const schoolId = req.params.schoolId;

        console.log(`Finding subjects for class ID: ${classId}${schoolId ? `, school ID: ${schoolId}` : ''}`);

        // Validate classId
        if (!classId) {
            return res.status(400).json({ message: "Class ID is required" });
        }

        let query = { sclassName: classId };
        if (schoolId) {
            query.school = schoolId;
        }

        console.log("Query:", query);
        let subjects = await Subject.find(query);
        
        console.log(`Found ${subjects.length} subjects`);
          if (subjects.length > 0) {
            res.status(200).json(subjects);
        } else {
            // Return empty array for consistency instead of message object
            res.status(200).json([]);
        }
    } catch (err) {
        console.error("Error in classSubjects:", err);
        res.status(500).json({ message: err.message || "Error retrieving subjects" });
    }
};

const freeSubjectList = async (req, res) => {
    try {
        console.log("Fetching free subjects for class ID:", req.params.id);
        
        let subjects = await Subject.find({ 
            sclassName: req.params.id, 
            teacher: { $exists: false } 
        });
        
        console.log(`Found ${subjects.length} free subjects`);
        
        if (subjects.length > 0) {
            res.status(200).json(subjects);
        } else {
            // Return empty array for consistency instead of message object
            res.status(200).json([]);
        }
    } catch (err) {
        console.error("Error in freeSubjectList:", err);
        res.status(500).json({ message: err.message || "Error retrieving free subjects" });
    }
};

const getSubjectDetail = async (req, res) => {
    try {
        console.log("Fetching subject details for ID:", req.params.id);
        
        if (!req.params.id) {
            return res.status(400).json({ message: "Subject ID is required" });
        }
        
        let subject = await Subject.findById(req.params.id);
        
        if (subject) {
            // Populate class information
            subject = await subject.populate("sclassName", "sclassName");
            
            // Populate teacher information if exists
            subject = await subject.populate("teacher", "name");
            
            console.log("Subject details found:", {
                id: subject._id,
                name: subject.subName,
                school: subject.school,
                class: subject.sclassName ? subject.sclassName.sclassName : 'Unknown',
                classId: subject.sclassName ? subject.sclassName._id : null
            });
            
            res.status(200).json(subject);
        } else {
            console.error("Subject not found with ID:", req.params.id);
            res.status(404).json({ message: "Subject not found" });
        }
    } catch (err) {
        console.error("Error in getSubjectDetail:", err);
        res.status(500).json({ message: err.message || "Error retrieving subject details" });
    }
}

const deleteSubject = async (req, res) => {
    try {
        const deletedSubject = await Subject.findByIdAndDelete(req.params.id);

        // Set the teachSubject field to null in teachers
        await Teacher.updateOne(
            { teachSubject: deletedSubject._id },
            { $unset: { teachSubject: "" }, $unset: { teachSubject: null } }
        );

        // Remove the objects containing the deleted subject from students' examResult array
        await Student.updateMany(
            {},
            { $pull: { examResult: { subName: deletedSubject._id } } }
        );

        // Remove the objects containing the deleted subject from students' attendance array
        await Student.updateMany(
            {},
            { $pull: { attendance: { subName: deletedSubject._id } } }
        );

        res.send(deletedSubject);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteSubjects = async (req, res) => {
    try {
        const deletedSubjects = await Subject.deleteMany({ school: req.params.id });

        // Set the teachSubject field to null in teachers
        await Teacher.updateMany(
            { teachSubject: { $in: deletedSubjects.map(subject => subject._id) } },
            { $unset: { teachSubject: "" }, $unset: { teachSubject: null } }
        );

        // Set examResult and attendance to null in all students
        await Student.updateMany(
            {},
            { $set: { examResult: null, attendance: null } }
        );

        res.send(deletedSubjects);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteSubjectsByClass = async (req, res) => {
    try {
        const deletedSubjects = await Subject.deleteMany({ sclassName: req.params.id });

        // Set the teachSubject field to null in teachers
        await Teacher.updateMany(
            { teachSubject: { $in: deletedSubjects.map(subject => subject._id) } },
            { $unset: { teachSubject: "" }, $unset: { teachSubject: null } }
        );

        // Set examResult and attendance to null in all students
        await Student.updateMany(
            {},
            { $set: { examResult: null, attendance: null } }
        );

        res.send(deletedSubjects);
    } catch (error) {
        res.status(500).json(error);
    }
};


module.exports = { subjectCreate, freeSubjectList, classSubjects, getSubjectDetail, deleteSubjectsByClass, deleteSubjects, deleteSubject, allSubjects };