import { configureStore } from '@reduxjs/toolkit';
import { userReducer } from './userRelated/userSlice';
import { studentReducer } from './studentRelated/studentSlice';
import { noticeReducer } from './noticeRelated/noticeSlice';
import { sclassReducer } from './sclassRelated/sclassSlice';
import { teacherReducer } from './teacherRelated/teacherSlice';
import { complainReducer } from './complainRelated/complainSlice';
import eventReducer from './eventRelated/eventSlice';
import resourceReducer from './resourceRelated/resourceSlice';
import assignmentReducer from './assignmentRelated/assignmentSlice';
import messageReducer from './messageRelated/messageSlice';
import subjectReducer from './subjectRelated/subjectSlice';
import adminReducer from './adminRelated/adminSlice';

const store = configureStore({
    reducer: {
        user: userReducer,
        student: studentReducer,
        teacher: teacherReducer,
        notice: noticeReducer,
        complain: complainReducer,
        sclass: sclassReducer,
        event: eventReducer,
        resource: resourceReducer,
        assignment: assignmentReducer,
        message: messageReducer,
        subject: subjectReducer,
        admin: adminReducer
    },    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    'user/authError', 
                    'user/getError',
                    'teacher/getError',
                    'admin/getError',
                    'student/getError',
                    'message/getError',
                    'message/getMessageDetailFailed',
                    'message/getInboxFailed',
                    'message/getSentMessagesFailed',
                    'notice/getError',
                    'complain/getError',
                    'sclass/getError',
                    'event/rejected',
                    'resource/rejected',
                    'assignment/rejected',
                    'subject/rejected'
                ],
                ignoredActionPaths: ['error', 'payload.error', 'meta.arg', 'payload.originalError'],
                ignoredPaths: [
                    'user.error',
                    'teacher.error',
                    'admin.error',
                    'student.error',
                    'message.error',
                    'notice.error',
                    'complain.error',
                    'sclass.error',
                    'event.error',
                    'resource.error',
                    'assignment.error',
                    'subject.error'
                ]
            },
        }),
});

export default store;
