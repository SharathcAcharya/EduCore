const router = require('express').Router();
const mongoose = require('mongoose');

// Health check endpoint
router.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.status(200).json({ 
        status: 'ok', 
        message: 'API is operational',
        dbStatus: dbStatus,
        timestamp: new Date().toISOString(),
        port: process.env.PORT || 5000
    });
});

// Ping endpoint for connection testing
router.get('/ping', (req, res) => {
    console.log('Ping received from client at', new Date().toISOString());          
    res.status(200).json({                   
        status: 'ok', 
        message: 'pong', 
        serverTime: new Date().toISOString(),
        port: process.env.PORT || 5000
    });
});

// const { adminRegister, adminLogIn, deleteAdmin, getAdminDetail, updateAdmin } = require('../controllers/admin-controller.js');

const { adminRegister, adminLogIn, getAdminDetail, getAllAdmins } = require('../controllers/admin-controller.js');

const { sclassCreate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents } = require('../controllers/class-controller.js');
const { complainCreate, complainList } = require('../controllers/complain-controller.js');
const { noticeCreate, noticeList, deleteNotices, deleteNotice, updateNotice } = require('../controllers/notice-controller.js');
const {
    studentRegister,
    studentLogIn,
    getStudents,
    getStudentDetail,
    deleteStudents,
    deleteStudent,
    updateStudent,
    updateStudentProfile,
    studentAttendance,
    deleteStudentsByClass,
    updateExamResult,
    clearAllStudentsAttendanceBySubject,
    clearAllStudentsAttendance,
    removeStudentAttendanceBySubject,
    removeStudentAttendance,
    findStudentByRollAndName } = require('../controllers/student_controller.js');
const { subjectCreate, classSubjects, deleteSubjectsByClass, getSubjectDetail, deleteSubject, freeSubjectList, allSubjects, deleteSubjects } = require('../controllers/subject-controller.js');
const { teacherRegister, teacherLogIn, getTeachers, getTeacherDetail, deleteTeachers, deleteTeachersByClass, deleteTeacher, updateTeacherSubject, teacherAttendance } = require('../controllers/teacher-controller.js');
const { createEvent, getAllEvents, getClassEvents, updateEvent, deleteEvent } = require('../controllers/event-controller.js');
const { createResource, getAllResources, getClassResources, getSubjectResources, updateResource, deleteResource } = require('../controllers/resource-controller.js');
const { createAssignment, getAssignments, getTeacherAssignments, getClassAssignments, getAssignmentDetail, submitAssignment, gradeSubmission, updateAssignment, deleteAssignment } = require('../controllers/assignment-controller.js');
const { createMessage, getInbox, getSentMessages, getMessageDetail, deleteMessage, getUnreadCount, getMessages, getBroadcastMessages } = require('../controllers/message-controller.js');

// Admin
router.post('/AdminReg', adminRegister);
router.post('/AdminLogin', adminLogIn);

router.get("/Admin/:id", getAdminDetail)
router.get("/Admins/:id", getAllAdmins)
// router.delete("/Admin/:id", deleteAdmin)

// router.put("/Admin/:id", updateAdmin)

// Student

router.post('/StudentReg', studentRegister);
router.post('/StudentLogin', studentLogIn)

router.get("/Students/:id", getStudents)
router.get("/Student/:id", getStudentDetail)
router.get("/StudentsByClass/:id", getStudents) // Add endpoint for students by class

router.delete("/Students/:id", deleteStudents)
router.delete("/StudentsClass/:id", deleteStudentsByClass)
router.delete("/Student/:id", deleteStudent)

router.put("/Student/:id", updateStudent)
router.put("/StudentProfile/:id", updateStudentProfile)

router.put('/UpdateExamResult/:id', updateExamResult)

router.put('/StudentAttendance/:id', studentAttendance)

router.put('/RemoveAllStudentsSubAtten/:id', clearAllStudentsAttendanceBySubject);
router.put('/RemoveAllStudentsAtten/:id', clearAllStudentsAttendance);

router.put('/RemoveStudentSubAtten/:id', removeStudentAttendanceBySubject);
router.put('/RemoveStudentAtten/:id', removeStudentAttendance)

// Teacher

router.post('/TeacherReg', teacherRegister);
router.post('/TeacherLogin', teacherLogIn)

router.get("/Teachers/:id", getTeachers)
router.get("/Teacher/:id", getTeacherDetail)
router.get("/Teachers/class/:id", getTeachers) // Added route for getting teachers by class

router.delete("/Teachers/:id", deleteTeachers)
router.delete("/TeachersClass/:id", deleteTeachersByClass)
router.delete("/Teacher/:id", deleteTeacher)

router.put("/TeacherSubject", updateTeacherSubject)

router.post('/TeacherAttendance/:id', teacherAttendance)

// Notice

router.post('/NoticeCreate', noticeCreate);

router.get('/NoticeList/:id', noticeList);

router.delete("/Notices/:id", deleteNotices)
router.delete("/Notice/:id", deleteNotice)

router.put("/Notice/:id", updateNotice)

// Complain

router.post('/ComplainCreate', complainCreate);

router.get('/ComplainList/:id', complainList);

// Sclass

router.post('/SclassCreate', sclassCreate);

router.get('/SclassList/:id', sclassList);
router.get('/Class/School/:id', sclassList); // For backward compatibility
router.get("/Sclass/:id", getSclassDetail)

router.get("/Sclass/Students/:id", getSclassStudents)

router.delete("/Sclasses/:id", deleteSclasses)
router.delete("/Sclass/:id", deleteSclass)

// Subject

router.post('/SubjectCreate', subjectCreate);

router.get('/AllSubjects/:id', allSubjects);
router.get('/subject/school/:id', allSubjects); // Route for getting subjects by school ID
router.get('/Subject/School/:id', allSubjects); // For backward compatibility
router.get('/ClassSubjects/:id', classSubjects);
router.get('/ClassSubjects/:schoolId/:classId', classSubjects); // New route for school+class combo
router.get('/FreeSubjectList/:id', freeSubjectList);
router.get("/Subject/:id", getSubjectDetail)

router.delete("/Subject/:id", deleteSubject)
router.delete("/Subjects/:id", deleteSubjects)
router.delete("/SubjectsClass/:id", deleteSubjectsByClass)

// Events Calendar
router.post('/EventCreate', createEvent);
router.get('/Events/:id', getAllEvents);
router.get('/Events/:schoolId/:classId', getClassEvents);
router.put('/Event/:id', updateEvent);
router.delete('/Event/:id', deleteEvent);

// Learning Resources
router.post('/ResourceCreate', createResource);
router.get('/Resources/:id', getAllResources);
router.get('/Resources/Class/:schoolId/:classId', getClassResources);
router.get('/Resources/Subject/:schoolId/:subjectId', getSubjectResources);
router.put('/Resource/:id', updateResource);
router.delete('/Resource/:id', deleteResource);

// Assignments
router.post('/AssignmentCreate', createAssignment);
router.get('/Assignments/:id', getAssignments);
router.get('/TeacherAssignments/:teacherId', getTeacherAssignments);
router.get('/ClassAssignments/:schoolId/:classId', getClassAssignments);
router.get('/Assignment/:id', getAssignmentDetail);
router.post('/Assignment/Submit/:id', submitAssignment);
router.post('/Assignment/Grade/:id', gradeSubmission);
router.put('/Assignment/:id', updateAssignment);
router.delete('/Assignment/:id', deleteAssignment);

// Messaging
router.post('/MessageCreate', createMessage);
router.get('/Inbox/:userId/:userModel', getInbox);
router.get('/SentMessages/:userId/:userModel', getSentMessages);
router.get('/Message/:id', getMessageDetail);
router.get('/Messages/:userId/:userModel/:receiverId', getMessages);
router.get('/UnreadCount/:userId/:userModel', getUnreadCount);
router.get('/BroadcastMessages/:userId/:userModel', getBroadcastMessages);
router.delete('/Message/:id', deleteMessage);

// Diagnostic routes
router.get('/FindStudentByRollAndName/:rollNum/:name', findStudentByRollAndName);
router.get('/ping', (req, res) => {
    console.log('Ping received from client at', new Date().toISOString());          
    res.status(200).json({                   
        status: 'ok', 
        message: 'pong', 
        serverTime: new Date().toISOString(),
        port: process.env.PORT || 5000
    });
});

module.exports = router;
