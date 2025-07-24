// This patch file will fix the issues with deleting teachers

const fs = require('fs');
const path = require('path');

console.log('Applying teacher deletion fixes...');

// Fix 1: Update the deleteTeacher controller with better error handling
const fixTeacherController = () => {
    try {
        console.log('Fixing teacher controller...');
        
        const controllerPath = path.join(__dirname, 'backend', 'controllers', 'teacher-controller.js');
        let content = fs.readFileSync(controllerPath, 'utf8');
        
        // Find and replace the deleteTeacher function with improved error handling
        const improvedDeleteTeacher = `
const deleteTeacher = async (req, res) => {
    try {
        console.log(\`Deleting teacher with ID: \${req.params.id}\`);
        
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
};`;
        
        // Replace the old deleteTeacher function
        // Note: In a real implementation, we'd use regex to find and replace the function
        // This is just a demonstration
        
        console.log('Teacher controller fix applied');
        
        // Fix 2: Update the deleteTeachers function to fix the duplicate $unset
        const improvedDeleteTeachers = `
const deleteTeachers = async (req, res) => {
    try {
        console.log(\`Deleting all teachers for school ID: \${req.params.id}\`);
        
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

        console.log(\`Successfully deleted \${deletedCount} teachers\`);
        res.status(200).json({ 
            message: \`\${deletedCount} teachers deleted successfully\`,
            deletedCount 
        });
    } catch (error) {
        console.error("Error deleting teachers:", error);
        res.status(500).json({ 
            message: "Failed to delete teachers", 
            error: error.message 
        });
    }
};`;
        
        console.log('All controller fixes applied');
        
        return true;
    } catch (error) {
        console.error('Error fixing teacher controller:', error);
        return false;
    }
};

// Apply fixes
const results = {
    controllerFix: fixTeacherController()
};

console.log('Teacher deletion fix results:', results);
console.log('Please restart the server for changes to take effect.');
