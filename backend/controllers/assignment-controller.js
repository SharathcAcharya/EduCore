const Assignment = require('../models/assignmentSchema.js');
const Teacher = require('../models/teacherSchema.js');

const createAssignment = async (req, res) => {
    try {
        console.log("Creating assignment with data:", req.body);
        
        // Enhanced validation for required fields
        const requiredFields = ['title', 'description', 'subject', 'sclassName', 'dueDate', 'school', 'assignedBy'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }
        
        // Validate due date is not in the past
        const dueDate = new Date(req.body.dueDate);
        const now = new Date();
        if (dueDate < now) {
            return res.status(400).json({ 
                message: "Due date cannot be in the past" 
            });
        }
        
        // Handle assignerModel validation - ensure it's either 'admin' or 'teacher'
        if (!req.body.assignerModel || !['admin', 'teacher'].includes(req.body.assignerModel)) {
            console.log("Invalid or missing assignerModel, defaulting to 'admin'");
            req.body.assignerModel = 'admin';
        }
        
        // Create the assignment object
        const assignment = new Assignment({
            ...req.body,
            assignedDate: new Date() // Ensure assigned date is set
        });
        
        const result = await assignment.save();
        
        if (!result) {
            throw new Error("Failed to save assignment");
        }
        
        console.log("Assignment created successfully:", result);
        
        // Populate the class and subject name before sending back the response
        const populatedAssignment = await Assignment.findById(result._id)
            .populate('sclassName', 'sclassName')
            .populate('subject', 'subName')
            .populate('assignedBy', 'name');
            
        res.status(201).json(populatedAssignment);
    } catch (err) {
        console.error("Error in createAssignment:", err);
        res.status(500).json({ message: err.message || "Error creating assignment" });
    }
};

const getAssignments = async (req, res) => {
    try {
        console.log("Fetching all assignments for school ID:", req.params.id);
        
        // For admin or school view - get all assignments for a school
        const assignments = await Assignment.find({ school: req.params.id })
            .populate('sclassName', 'sclassName')
            .populate('subject', 'subName')
            .populate('assignedBy', 'name')
            .sort({ dueDate: 1 }); // Sort by due date, ascending

        console.log(`Found ${assignments.length} assignments`);
        
        if (assignments.length > 0) {
            res.status(200).json(assignments);
        } else {
            // Return empty array instead of message object for consistency
            res.status(200).json([]);
        }
    } catch (error) {
        console.error("Error in getAssignments:", error);
        res.status(500).json({ message: error.message || "Error retrieving assignments" });
    }
};

const getTeacherAssignments = async (req, res) => {
    try {
        console.log("Fetching teacher assignments for teacher ID:", req.params.teacherId);
        
        // Get the teacher details to find their class and school
        const teacher = await Teacher.findById(req.params.teacherId);
        
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        
        // For teacher view - get all assignments created by a teacher
        // OR all assignments for their class that were created by an admin
        const assignments = await Assignment.find({
            $or: [
                // Assignments created by this teacher
                { assignedBy: req.params.teacherId, assignerModel: 'teacher' },
                
                // Assignments created by admin for this teacher's class
                { 
                    sclassName: teacher.teachSclass,
                    school: teacher.school,
                    assignerModel: 'admin'
                }
            ]
        })
            .populate('sclassName', 'sclassName')
            .populate('subject', 'subName')
            .populate('assignedBy', 'name')
            .populate('school', 'schoolName')
            .sort({ assignedDate: -1 }); // Sort by assigned date, newest first
        
        console.log(`Found ${assignments.length} assignments for teacher`);
        
        if (assignments.length > 0) {
            res.status(200).json(assignments);
        } else {
            // Return empty array instead of message object for consistency
            res.status(200).json([]);
        }
    } catch (error) {
        console.error("Error in getTeacherAssignments:", error);
        res.status(500).json({ message: error.message || "Error retrieving teacher assignments" });
    }
};

const getClassAssignments = async (req, res) => {
    try {
        console.log("Fetching class assignments for school:", req.params.schoolId, "class:", req.params.classId);
        
        // For student view - get assignments for a specific class
        const assignments = await Assignment.find({
            school: req.params.schoolId,
            sclassName: req.params.classId
        })
            .populate('subject', 'subName')
            .populate('assignedBy', 'name')
            .populate('sclassName', 'sclassName')
            .populate('school', 'schoolName')
            .sort({ dueDate: 1 }); // Sort by due date, ascending

        console.log(`Found ${assignments.length} assignments for class`);
        
        if (assignments.length > 0) {
            res.status(200).json(assignments);
        } else {
            // Return empty array instead of message object for consistency
            res.status(200).json([]);
        }
    } catch (error) {
        console.error("Error in getClassAssignments:", error);
        res.status(500).json({ message: error.message || "Error retrieving class assignments" });
    }
};

const getAssignmentDetail = async (req, res) => {
    try {
        console.log("Fetching assignment detail for ID:", req.params.id);
        
        const assignment = await Assignment.findById(req.params.id)
            .populate('sclassName', 'sclassName')
            .populate('subject', 'subName')
            .populate('assignedBy', 'name')
            .populate('submissions.student', 'name rollNum');

        if (assignment) {
            console.log("Assignment found:", assignment._id);
            res.status(200).json(assignment);
        } else {
            console.log("Assignment not found for ID:", req.params.id);
            res.status(404).json({ message: "Assignment not found" });
        }
    } catch (error) {
        console.error("Error in getAssignmentDetail:", error);
        res.status(500).json({ message: error.message || "Error retrieving assignment details" });
    }
};

const submitAssignment = async (req, res) => {
    try {
        console.log("Processing assignment submission:", req.params.id, req.body);
        
        const { studentId, submissionFile } = req.body;
        
        if (!studentId || !submissionFile) {
            return res.status(400).json({ message: "Missing student ID or submission file" });
        }
        
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            console.log("Assignment not found for ID:", req.params.id);
            return res.status(404).json({ message: "Assignment not found" });
        }

        // Check if this student has already submitted
        const existingSubmission = assignment.submissions.find(
            submission => submission.student.toString() === studentId
        );

        if (existingSubmission) {
            console.log("Updating existing submission for student:", studentId);
            // Update existing submission
            existingSubmission.submissionFile = submissionFile;
            existingSubmission.submissionDate = new Date();
            
            // Check if submission is late
            if (new Date() > assignment.dueDate) {
                existingSubmission.status = 'Late';
            } else {
                existingSubmission.status = 'Submitted';
            }
        } else {
            console.log("Creating new submission for student:", studentId);
            // Create new submission
            const newSubmission = {
                student: studentId,
                submissionFile,
                submissionDate: new Date(),
                status: new Date() > assignment.dueDate ? 'Late' : 'Submitted'
            };
            assignment.submissions.push(newSubmission);
        }

        const savedAssignment = await assignment.save();
        console.log("Assignment submission saved successfully");
        res.status(200).json(savedAssignment);
    } catch (error) {
        console.error("Error in submitAssignment:", error);
        res.status(500).json({ message: error.message || "Error submitting assignment" });
    }
};

const gradeSubmission = async (req, res) => {
    try {
        console.log("Grading submission:", req.params.id, req.body);
        
        const { submissionId, marks, feedback } = req.body;
        
        if (!submissionId || marks === undefined) {
            return res.status(400).json({ message: "Missing submission ID or marks" });
        }
        
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            console.log("Assignment not found for ID:", req.params.id);
            return res.status(404).json({ message: "Assignment not found" });
        }

        const submission = assignment.submissions.id(submissionId);
        if (!submission) {
            console.log("Submission not found with ID:", submissionId);
            return res.status(404).json({ message: "Submission not found" });
        }

        submission.marks = marks;
        submission.feedback = feedback;
        submission.status = 'Graded';

        const savedAssignment = await assignment.save();
        console.log("Submission graded successfully");
        res.status(200).json(savedAssignment);
    } catch (error) {
        console.error("Error in gradeSubmission:", error);
        res.status(500).json({ message: error.message || "Error grading submission" });
    }
};

const updateAssignment = async (req, res) => {
    try {
        console.log("Updating assignment:", req.params.id, req.body);
        
        const result = await Assignment.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        )
        .populate('sclassName', 'sclassName')
        .populate('subject', 'subName')
        .populate('assignedBy', 'name');
        
        if (!result) {
            console.log("Assignment not found for update, ID:", req.params.id);
            return res.status(404).json({ message: "Assignment not found" });
        }
        
        console.log("Assignment updated successfully");
        res.status(200).json(result);
    } catch (error) {
        console.error("Error in updateAssignment:", error);
        res.status(500).json({ message: error.message || "Error updating assignment" });
    }
};

const deleteAssignment = async (req, res) => {
    try {
        console.log("Deleting assignment:", req.params.id);
        
        const assignment = await Assignment.findById(req.params.id);
        
        if (!assignment) {
            console.log("Assignment not found for deletion, ID:", req.params.id);
            return res.status(404).json({ message: "Assignment not found" });
        }
        
        await Assignment.findByIdAndDelete(req.params.id);
        console.log("Assignment deleted successfully");
        res.status(200).json({ message: "Assignment has been deleted" });
    } catch (error) {
        console.error("Error in deleteAssignment:", error);
        res.status(500).json({ message: error.message || "Error deleting assignment" });
    }
};

module.exports = {
    createAssignment,
    getAssignments,
    getTeacherAssignments,
    getClassAssignments,
    getAssignmentDetail,
    submitAssignment,
    gradeSubmission,
    updateAssignment,
    deleteAssignment
};
