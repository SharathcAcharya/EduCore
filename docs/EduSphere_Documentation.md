# EduSphere - School Management System

## Comprehensive Documentation

### Table of Contents

1. [Introduction](#1-introduction)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Installation Guide](#4-installation-guide)
5. [System Structure](#5-system-structure)
6. [Backend Architecture](#6-backend-architecture)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Database Schema](#8-database-schema)
9. [User Roles and Permissions](#9-user-roles-and-permissions)
10. [Key Features](#10-key-features)
11. [API Documentation](#11-api-documentation)
12. [State Management](#12-state-management)
13. [Authentication and Authorization](#13-authentication-and-authorization)
14. [Messaging System](#14-messaging-system)
15. [Real-time Features](#15-real-time-features)
16. [Data Visualization](#16-data-visualization)
17. [Deployment Guide](#17-deployment-guide)
18. [Troubleshooting](#18-troubleshooting)
19. [Future Enhancements](#19-future-enhancements)
20. [Conclusion](#20-conclusion)

---

## 1. Introduction

EduSphere is a comprehensive School Management System built using the MERN (MongoDB, Express.js, React.js, Node.js) stack. It serves as a complete solution for educational institutions to manage administrative tasks, academic activities, and facilitate communication between administrators, teachers, and students.

### Purpose and Vision

EduSphere aims to digitize and automate various aspects of school management, reducing administrative overhead and enabling educators to focus more on teaching. The system provides a centralized platform for managing student data, attendance, assignments, grades, and communication.

### Core Objectives

- Streamline administrative tasks and record-keeping
- Enhance communication between students, teachers, and administrators
- Provide real-time insights into student performance through data visualization
- Support academic planning and resource management
- Create a paperless environment for educational institutions

---

## 2. System Architecture

EduSphere follows a 3-tier architecture:

1. **Presentation Layer (Frontend)**:

   - Built with React.js
   - Material UI for consistent user interface
   - Redux for state management
   - React Router for navigation

2. **Application Layer (Backend)**:

   - Node.js with Express.js framework
   - RESTful API endpoints
   - Authentication middleware
   - Business logic controllers

3. **Data Layer**:
   - MongoDB database
   - Mongoose ODM (Object Data Modeling)
   - Data validation and schema enforcement

### Architecture Diagram

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  Frontend       │      │  Backend        │      │  Database       │
│  React.js       │◄────►│  Node.js        │◄────►│  MongoDB        │
│  Redux          │      │  Express.js     │      │                 │
│  Material UI    │      │  REST API       │      │                 │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

---

## 3. Technology Stack

### Frontend

- **React.js**: JavaScript library for building user interfaces
- **Redux**: State management library with Redux Toolkit
- **Material UI**: React component library implementing Google's Material Design
- **React Router**: Routing library for React
- **Axios**: Promise-based HTTP client for API requests
- **Recharts**: Composable charting library for data visualization
- **Socket.io-client**: Client library for real-time communication

### Backend

- **Node.js**: JavaScript runtime for server-side applications
- **Express.js**: Web application framework for Node.js
- **MongoDB**: NoSQL document database
- **Mongoose**: MongoDB object modeling tool
- **JWT (JSON Web Tokens)**: For authentication and secure information transmission
- **Bcrypt**: Library for secure password hashing
- **Multer**: Middleware for handling multipart/form-data
- **Socket.io**: Library for real-time, bidirectional communication

### Development Tools

- **Nodemon**: Utility for automatically restarting server during development
- **Webpack**: Module bundler for frontend
- **Dotenv**: Module for loading environment variables
- **Git**: Version control system
- **npm**: Package manager for JavaScript

---

## 4. Installation Guide

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)
- MongoDB (v4.4 or later)

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/edusphere.git
   cd edusphere
   ```

2. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:

   ```
   MONGO_URI=mongodb://localhost:27017/edusphere
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:

   ```bash
   cd ../frontend
   ```

2. Install frontend dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory:

   ```
   REACT_APP_BASE_URL=http://localhost:5000
   ```

4. Start the frontend development server:

   ```bash
   npm start
   ```

5. Access the application at `http://localhost:3000`

---

## 5. System Structure

EduSphere is organized with a clear separation of concerns between backend and frontend components:

### Project Structure

```
edusphere/
├── backend/
│   ├── controllers/      # Business logic handlers
│   ├── models/           # Database schemas
│   ├── routes/           # API route definitions
│   ├── utils/            # Utility functions
│   ├── .env              # Environment variables
│   ├── index.js          # Entry point
│   └── package.json      # Backend dependencies
│
├── frontend/
│   ├── public/           # Static files
│   ├── src/
│   │   ├── assets/       # Images, fonts, etc.
│   │   ├── components/   # Reusable UI components
│   │   ├── config.js     # Application configuration
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   ├── redux/        # Redux state management
│   │   ├── utils/        # Utility functions
│   │   ├── App.js        # Main application component
│   │   └── index.js      # Frontend entry point
│   ├── .env              # Frontend environment variables
│   └── package.json      # Frontend dependencies
│
├── docs/                 # Documentation
└── README.md             # Project overview
```

---

## 6. Backend Architecture

The backend of EduSphere follows the Model-View-Controller (MVC) architectural pattern:

### Models

Database schemas defined using Mongoose:

- `adminSchema.js`: Admin user data structure
- `assignmentSchema.js`: Assignment data structure
- `complainSchema.js`: Complaint data structure
- `eventSchema.js`: School event data structure
- `messageSchema.js`: Messaging system data structure
- `noticeSchema.js`: School notice data structure
- `resourceSchema.js`: Learning resource data structure
- `sclassSchema.js`: School class data structure
- `studentSchema.js`: Student user data structure
- `subjectSchema.js`: Subject data structure
- `teacherSchema.js`: Teacher user data structure

### Controllers

Business logic handlers that process requests and send responses:

- `admin-controller.js`: Admin-related operations
- `assignment-controller.js`: Assignment management
- `class-controller.js`: Class management
- `complain-controller.js`: Complaint handling
- `event-controller.js`: Event management
- `message-controller.js`: Messaging system
- `notice-controller.js`: Notice management
- `resource-controller.js`: Learning resource management
- `student_controller.js`: Student-related operations
- `subject-controller.js`: Subject management
- `teacher-controller.js`: Teacher-related operations

### Routes

API endpoints defined in `routes/route.js`, organized by entity and operation.

### Entry Point

`index.js` sets up the Express application, middleware, database connection, and API routes.

---

## 7. Frontend Architecture

The frontend of EduSphere is built with React.js and follows a component-based architecture:

### Key Directories and Files

#### Components

Reusable UI elements located in `src/components/`:

- Form elements
- Navigation components
- Cards and containers
- Data visualization components
- Modals and dialogs

#### Pages

Page-level components organized by user role:

- `admin/`: Admin dashboard and related pages
  - Student management
  - Teacher management
  - Class management
  - Subject management
  - Notice management
  - Events management
  - Analytics and reporting
- `teacher/`: Teacher dashboard and related pages
  - Attendance tracking
  - Assignment management
  - Grading interface
  - Resource management
- `student/`: Student dashboard and related pages
  - Profile and academic records
  - Assignment submission
  - Resource access
  - Performance tracking
- `Homepage.js`: Landing page
- `LoginPage.js`: Authentication page
- `ChooseUser.js`: User role selection

#### Redux

State management organized by feature:

- `adminRelated/`: Admin state management
- `assignmentRelated/`: Assignment state management
- `eventRelated/`: Event state management
- `messageRelated/`: Messaging state management
- `resourceRelated/`: Resource state management
- `sclassRelated/`: Class state management
- `studentRelated/`: Student state management
- `subjectRelated/`: Subject state management
- `teacherRelated/`: Teacher state management
- `userRelated/`: User authentication state

---

## 8. Database Schema

EduSphere uses MongoDB with Mongoose for data modeling. Here are the key schemas:

### Admin Schema

```javascript
{
  name: String,
  email: String,
  password: String,
  role: { type: String, default: "Admin" },
  school: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}
```

### Student Schema

```javascript
{
  name: String,
  email: String,
  password: String,
  role: { type: String, default: "Student" },
  school: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  rollNum: Number,
  sclassName: { type: mongoose.Schema.Types.ObjectId, ref: "Sclass" },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
  attendance: [{ date: Date, status: String }],
  gender: String,
  dob: Date,
  createdAt: { type: Date, default: Date.now }
}
```

### Teacher Schema

```javascript
{
  name: String,
  email: String,
  password: String,
  role: { type: String, default: "Teacher" },
  school: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  teachSubject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  teachSclass: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sclass" }],
  createdAt: { type: Date, default: Date.now }
}
```

### Class Schema

```javascript
{
  sclassName: String,
  school: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  createdAt: { type: Date, default: Date.now }
}
```

### Subject Schema

```javascript
{
  subName: String,
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sclass" }],
  school: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  createdAt: { type: Date, default: Date.now }
}
```

### Assignment Schema

```javascript
{
  title: String,
  description: String,
  subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  sclassName: { type: mongoose.Schema.Types.ObjectId, ref: "Sclass" },
  dueDate: Date,
  maxMarks: Number,
  school: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  createdAt: { type: Date, default: Date.now }
}
```

### Event Schema

```javascript
{
  title: String,
  description: String,
  eventDate: Date,
  category: String, // "holiday", "exam", "meeting", "activity"
  school: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sclass" }], // Empty array means school-wide
  createdAt: { type: Date, default: Date.now }
}
```

### Message Schema

```javascript
{
  sender: {
    id: mongoose.Schema.Types.ObjectId,
    model: String  // "Admin", "Teacher", or "Student"
  },
  receiver: {
    id: mongoose.Schema.Types.ObjectId,
    model: String
  },
  content: String,
  attachments: [String],
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}
```

### Resource Schema

```javascript
{
  title: String,
  description: String,
  resourceType: String, // "document", "video", "link", "image"
  resourceUrl: String,
  subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sclass" }],
  school: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  uploadedBy: {
    id: mongoose.Schema.Types.ObjectId,
    model: String // "Admin" or "Teacher"
  },
  createdAt: { type: Date, default: Date.now }
}
```

### Complain Schema

```javascript
{
  complainTitle: String,
  complainDescription: String,
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  school: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  status: { type: String, default: "Pending" }, // "Pending", "In Progress", "Resolved"
  createdAt: { type: Date, default: Date.now }
}
```

### Notice Schema

```javascript
{
  title: String,
  details: String,
  date: { type: Date, default: Date.now },
  school: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sclass" }], // Empty array means school-wide
  createdAt: { type: Date, default: Date.now }
}
```

---

## 9. User Roles and Permissions

EduSphere implements a role-based access control system with three primary user roles:

### Admin

**Permissions**:

- Create and manage school profile
- Add, edit, and remove teachers and students
- Create and manage classes and subjects
- Assign teachers to classes and subjects
- Generate and view reports
- Send notices and announcements
- Manage system settings
- Access all system features

### Teacher

**Permissions**:

- View assigned classes and subjects
- Create and manage assignments
- Take attendance for assigned classes
- Grade student submissions
- Communicate with students and admins
- View student performance in assigned subjects
- Create learning resources
- Manage their profile

### Student

**Permissions**:

- View assigned classes and subjects
- View and submit assignments
- Access learning resources
- View attendance and grades
- Communicate with teachers and admin
- View notices and announcements
- Submit complaints
- Manage their profile

### Authorization Implementation

- JWT-based authentication
- Role checking middleware
- Protected routes in frontend and backend
- Conditional rendering based on user role

---

## 10. Key Features

### Admin Dashboard

- School statistics and performance metrics
- User management (teachers and students)
- Class and subject management
- System-wide announcements
- Reports and analytics

#### Student Management

- Register new students
- View and edit student profiles
- Assign students to classes
- Track academic performance

#### Teacher Management

- Register new teachers
- Assign subjects and classes
- Track teacher attendance

#### Class Management

- Create and manage school classes
- Assign teachers to classes
- View class details and enrolled students

#### Subject Management

- Create and manage subjects
- Assign subjects to classes and teachers

#### Notice Management

- Publish announcements school-wide or to specific classes

#### Events Calendar

- Create and manage school events
- Categorize events (holidays, exams, meetings, activities)
- Assign events to specific classes or make them school-wide

#### Resource Management

- Upload and share educational materials
- Categorize resources by type and subject
- Manage access to resources

### Teacher Features

- Dashboard with quick access to teacher functions
- View assigned classes and subjects

#### Student Attendance

- Record daily attendance for assigned classes
- View attendance reports

#### Student Assessment

- Enter and update exam marks
- Evaluate student performance

#### Assignment Management

- Create and assign homework/tasks
- Review submitted assignments
- Provide grades and feedback

#### Class Resources

- Upload and share learning materials
- Organize resources by subject

#### Messaging

- Communicate with students and administrators

### Student Features

- Dashboard with class information and timetable
- Access recent notices and upcoming events

#### Academic Performance

- View attendance records
- Check exam results and progress reports
- Visual representation of performance metrics

#### Assignments

- View assigned tasks and submission deadlines
- Submit completed assignments
- Check grades and feedback

#### Resources

- Access learning materials shared by teachers
- Filter resources by subject

#### Events Calendar

- View school events and activities
- Filter events by category

#### Messaging

- Communicate with teachers and administrators

#### Complain System

- Submit issues or concerns to the administration

### Common Features

- User authentication
- Profile management
- Messaging system
- Notifications
- Responsive design for mobile and desktop

---

## 11. API Documentation

### Authentication Endpoints

- `POST /api/login`: Authenticate user and return JWT
- `POST /api/registerAdmin`: Register new admin
- `GET /api/auth/verify`: Verify JWT token

### Admin Endpoints

- `GET /api/admin/students`: Get all students
- `POST /api/admin/student/add`: Add new student
- `DELETE /api/admin/student/delete/:id`: Delete student
- `GET /api/admin/teachers`: Get all teachers
- `POST /api/admin/teacher/add`: Add new teacher
- `DELETE /api/admin/teacher/delete/:id`: Delete teacher

### Class Endpoints

- `GET /api/class/getClasses/:id`: Get classes for a school
- `POST /api/class/addclass`: Create new class
- `DELETE /api/class/delete/:id`: Delete class

### Subject Endpoints

- `GET /api/subject/getSubjects/:id`: Get subjects for a school
- `POST /api/subject/addsubject`: Create new subject
- `DELETE /api/subject/delete/:id`: Delete subject

### Assignment Endpoints

- `GET /api/assignment/getAssignments/:id`: Get assignments for a school
- `POST /api/assignment/addassignment`: Create new assignment
- `DELETE /api/assignment/delete/:id`: Delete assignment

### Messaging Endpoints

- `GET /api/message/get/:receiverId/:receiverModel`: Get messages for a user
- `POST /api/message/send`: Send a message
- `PUT /api/message/markAsRead/:id`: Mark message as read

### Notice Endpoints

- `GET /api/notice/getNotices/:id`: Get notices for a school
- `POST /api/notice/addnotice`: Create new notice
- `DELETE /api/notice/delete/:id`: Delete notice

### Event Endpoints

- `GET /api/event/getEvents/:id`: Get events for a school
- `POST /api/event/addevent`: Create new event
- `DELETE /api/event/delete/:id`: Delete event

### Resource Endpoints

- `GET /api/resource/getResources/:id`: Get resources for a school
- `POST /api/resource/addresource`: Add new resource
- `DELETE /api/resource/delete/:id`: Delete resource

### Complain Endpoints

- `GET /api/complain/getComplains/:id`: Get complaints for a school
- `POST /api/complain/addcomplain`: Submit new complaint
- `PUT /api/complain/updatestatus/:id`: Update complaint status

---

## 12. State Management

EduSphere uses Redux with Redux Toolkit for centralized state management:

### Store Configuration

The main Redux store is configured in `frontend/src/redux/store.js`, combining multiple reducers for different features.

### Slices

Feature-specific state logic is organized into slices:

- `userSlice.js`: Authentication state
- `adminSlice.js`: Admin-related state
- `teacherSlice.js`: Teacher-related state
- `studentSlice.js`: Student-related state
- `sclassSlice.js`: Class-related state
- `subjectSlice.js`: Subject-related state
- `assignmentSlice.js`: Assignment-related state
- `messageSlice.js`: Messaging state
- `noticeSlice.js`: Notice state
- `resourceSlice.js`: Resource state
- `eventSlice.js`: Event state

### API Handlers

Asynchronous API calls are handled in separate files using Redux Toolkit's `createAsyncThunk`:

- `userHandle.js`: Authentication API calls
- `adminHandle.js`: Admin-related API calls
- `teacherHandle.js`: Teacher-related API calls
- `studentHandle.js`: Student-related API calls
- `sclassHandle.js`: Class-related API calls
- `subjectHandle.js`: Subject-related API calls
- `assignmentHandle.js`: Assignment-related API calls
- `messageHandle.js`: Messaging API calls
- `noticeHandle.js`: Notice API calls
- `resourceHandle.js`: Resource API calls
- `eventHandle.js`: Event API calls

### State Access Pattern

Components access Redux state through the `useSelector` hook and dispatch actions using the `useDispatch` hook.

---

## 13. Authentication and Authorization

### Authentication Flow

1. User submits login credentials (email/password)
2. Backend validates credentials against database
3. If valid, JWT token is generated and sent to client
4. Frontend stores token in local storage
5. Token is included in Authorization header for subsequent API requests
6. Backend middleware validates token for protected routes

### JWT Implementation

- Tokens include user ID, role, and expiration
- Token expiration set to 24 hours
- Refresh token mechanism for extended sessions

### Protected Routes

- Frontend: React Router with custom `AuthCheck` component
- Backend: JWT verification middleware

### Password Security

- Passwords hashed using bcrypt before storage
- Minimum password strength requirements enforced

---

## 14. Messaging System

EduSphere includes a comprehensive messaging system for communication between users:

### Features

- Direct messaging between users (admin, teachers, students)
- Group messaging for classes
- Notification for new messages
- Read status tracking
- Message history

### Implementation

- Messages stored in MongoDB using `messageSchema`
- Real-time updates using Socket.io
- Messages organized by sender and receiver
- Support for text-based messages with future expansion for attachments

### User Interface

- Chat interface with conversation history
- Unread message indicators
- Message composition with rich text support
- User search and selection

---

## 15. Real-time Features

EduSphere implements real-time functionality using Socket.io:

### Implemented Features

- Instant messaging
- Notification delivery
- Online status indicators

### Socket.io Setup

- Backend initialization in `index.js`
- Client connection in frontend components
- Event listeners for various real-time updates

### Event Types

- `message`: New message notification
- `notice`: System-wide announcement
- `assignment`: New assignment notification
- `grade`: Grade update notification

---

## 16. Data Visualization

EduSphere uses Recharts for data visualization:

### Types of Visualizations

- Bar charts for performance comparison
- Pie charts for attendance statistics
- Line charts for performance trends
- Area charts for participation metrics

### Implementation

- Chart components in `frontend/src/components`
- Data processing utilities in `frontend/src/utils`
- Dynamic data loading from Redux store
- Responsive design for different screen sizes

### Dashboard Analytics

- Admin: School-wide statistics
- Teacher: Class and subject performance
- Student: Personal performance trends

---

## 17. Deployment Guide

### Backend Deployment (Node.js)

1. Set up environment variables for production
2. Install PM2 for process management
3. Configure NGINX as a reverse proxy
4. Set up SSL certificate
5. Deploy to VPS or cloud service (AWS, DigitalOcean, etc.)

### Frontend Deployment (React)

1. Build production bundle: `npm run build`
2. Deploy static files to CDN or hosting service (Netlify, Vercel, etc.)
3. Configure environment variables for production API endpoint

### Database Deployment (MongoDB)

1. Set up MongoDB Atlas cluster
2. Configure network access and database users
3. Update connection string in backend environment variables

### Continuous Integration/Deployment

1. Set up GitHub Actions or similar CI/CD pipeline
2. Configure automatic testing and deployment on push
3. Implement staging environment for pre-production testing

---

## 18. Troubleshooting

### Common Issues and Solutions

#### Backend Connection Issues

- Check MongoDB connection string
- Verify network connectivity
- Ensure correct environment variables

#### Authentication Problems

- Check JWT secret consistency
- Verify token expiration settings
- Clear browser storage and try again

#### Data Not Loading

- Check Redux state configuration
- Verify API endpoint correctness
- Check for CORS issues

#### Performance Issues

- Implement database indexing
- Optimize React component rendering
- Enable server-side caching

### Debugging Tools

- Redux DevTools for state inspection
- React Developer Tools for component debugging
- MongoDB Compass for database inspection
- Network tab in browser dev tools for API debugging

---

## 19. Future Enhancements

### Planned Features

- Mobile application using React Native
- Advanced analytics and reporting
- Parent portal for student guardians
- Online examination system
- Learning management system integration
- Fee management module
- Library management module
- Transport management module

### Technical Improvements

- Implement GraphQL API
- Migrate to TypeScript
- Enhance test coverage
- Implement microservices architecture
- Add progressive web app (PWA) capabilities

---

## 20. Conclusion

EduSphere provides a comprehensive solution for educational institutions to manage their administrative and academic operations efficiently. With its user-friendly interface, robust features, and scalable architecture, EduSphere aims to transform the way schools operate in the digital age.

The system streamlines administrative tasks, enhances communication between stakeholders, and provides valuable insights through data visualization. By digitizing various aspects of school management, EduSphere helps educational institutions create a more organized, efficient, and paperless environment.

Key strengths of the system include:

- Comprehensive user role management
- Intuitive and responsive user interfaces
- Robust data handling and security
- Real-time communication features
- Modular and extensible architecture

The modular design allows for future expansion and customization to meet the evolving needs of educational institutions. By leveraging modern web technologies and following best practices in software development, EduSphere delivers a reliable, secure, and performant platform for school management.

---

© 2025 EduSphere. All Rights Reserved.

EduSphere follows a 3-tier architecture:

1. **Presentation Layer (Frontend)**:

   - Built with React.js
   - Material UI for consistent user interface
   - Redux for state management
   - React Router for navigation

2. **Application Layer (Backend)**:

   - Node.js with Express.js framework
   - RESTful API endpoints
   - Authentication middleware
   - Business logic controllers

3. **Data Layer**:
   - MongoDB database
   - Mongoose ODM (Object Data Modeling)
   - Data validation and schema enforcement

### Architecture Diagram

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  Frontend       │      │  Backend        │      │  Database       │
│  React.js       │◄────►│  Node.js        │◄────►│  MongoDB        │
│  Redux          │      │  Express.js     │      │                 │
│  Material UI    │      │  REST API       │      │                 │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

---

## 3. Technology Stack

### Frontend

- **React.js**: JavaScript library for building user interfaces
- **Redux**: State management library with Redux Toolkit
- **Material UI**: React component library implementing Google's Material Design
- **Axios**: Promise-based HTTP client for API requests
- **React Router**: Routing library for React
- **Recharts**: Composable charting library for data visualization
- **Socket.io-client**: Client library for real-time communication

### Backend

- **Node.js**: JavaScript runtime for server-side applications
- **Express.js**: Web application framework for Node.js
- **Mongoose**: MongoDB object modeling tool
- **JWT (JSON Web Tokens)**: For authentication and secure information transmission
- **Bcrypt**: Library for secure password hashing
- **Multer**: Middleware for handling multipart/form-data
- **Socket.io**: Library for real-time, bidirectional communication

### Database

- **MongoDB**: NoSQL document database
- **MongoDB Atlas**: Cloud database service (for production deployment)

### Development Tools

- **Git**: Version control system
- **npm**: Package manager for JavaScript
- **Nodemon**: Utility for automatically restarting server during development
- **Dotenv**: Module for loading environment variables

---

## 4. Installation Guide

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)
- MongoDB (v4.4 or later)

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/edusphere.git
   cd edusphere
   ```

2. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:

   ```
   MONGO_URI=mongodb://localhost:27017/edusphere
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:

   ```bash
   cd ../frontend
   ```

2. Install frontend dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory:

   ```
   REACT_APP_BASE_URL=http://localhost:5000
   ```

4. Start the frontend development server:

   ```bash
   npm start
   ```

5. Access the application at `http://localhost:3000`

---

## 5. System Structure

EduSphere is organized with a clear separation of concerns between backend and frontend components:

### Project Structure

```
edusphere/
├── backend/
│   ├── controllers/      # Business logic handlers
│   ├── models/           # Database schemas
│   ├── routes/           # API route definitions
│   ├── utils/            # Utility functions
│   ├── .env              # Environment variables
│   ├── index.js          # Entry point
│   └── package.json      # Backend dependencies
│
├── frontend/
│   ├── public/           # Static files
│   ├── src/
│   │   ├── assets/       # Images, fonts, etc.
│   │   ├── components/   # Reusable UI components
│   │   ├── config.js     # Application configuration
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   ├── redux/        # Redux state management
│   │   ├── utils/        # Utility functions
│   │   ├── App.js        # Main application component
│   │   └── index.js      # Frontend entry point
│   ├── .env              # Frontend environment variables
│   └── package.json      # Frontend dependencies
│
├── docs/                 # Documentation
└── README.md             # Project overview
```

---

## 6. Backend Architecture

The backend of EduSphere follows the Model-View-Controller (MVC) architectural pattern:

### Models

Database schemas defined using Mongoose:

- `adminSchema.js`: Admin user data structure
- `assignmentSchema.js`: Assignment data structure
- `complainSchema.js`: Complaint data structure
- `eventSchema.js`: School event data structure
- `messageSchema.js`: Messaging system data structure
- `noticeSchema.js`: School notice data structure
- `resourceSchema.js`: Learning resource data structure
- `sclassSchema.js`: School class data structure
- `studentSchema.js`: Student user data structure
- `subjectSchema.js`: Subject data structure
- `teacherSchema.js`: Teacher user data structure

### Controllers

Business logic handlers that process requests and send responses:

- `admin-controller.js`: Admin-related operations
- `assignment-controller.js`: Assignment management
- `class-controller.js`: Class management
- `complain-controller.js`: Complaint handling
- `event-controller.js`: Event management
- `message-controller.js`: Messaging system
- `notice-controller.js`: Notice management
- `resource-controller.js`: Learning resource management
- `student_controller.js`: Student-related operations
- `subject-controller.js`: Subject management
- `teacher-controller.js`: Teacher-related operations

### Routes

API endpoints defined in `routes/route.js`, organized by entity and operation.

### Entry Point

`index.js` sets up the Express application, middleware, database connection, and API routes.

---

## 7. Frontend Architecture

The frontend of EduSphere is built with React.js and follows a component-based architecture:

### Key Directories and Files

#### Components

Reusable UI elements located in `src/components/`:

- Form elements
- Navigation components
- Cards and containers
- Data visualization components
- Modals and dialogs

#### Pages

Page-level components organized by user role:

- `admin/`: Admin dashboard and related pages
- `teacher/`: Teacher dashboard and related pages
- `student/`: Student dashboard and related pages
- `Homepage.js`: Landing page
- `LoginPage.js`: Authentication page
- `ChooseUser.js`: User role selection

#### Redux

State management organized by feature:

- `adminRelated/`: Admin state management
- `assignmentRelated/`: Assignment state management
- `eventRelated/`: Event state management
- `messageRelated/`: Messaging state management
- `resourceRelated/`: Resource state management
- `sclassRelated/`: Class state management
- `studentRelated/`: Student state management
- `subjectRelated/`: Subject state management
- `teacherRelated/`: Teacher state management
- `userRelated/`: User authentication state

#### Hooks

Custom React hooks for shared functionality:

- API request hooks
- Authentication hooks
- Form validation hooks

#### Utils

Utility functions for:

- Date formatting
- Data processing
- Input validation
- Local storage operations

---

## 8. Database Schema

EduSphere uses MongoDB with Mongoose for data modeling. Here are the key schemas:

### Admin Schema

```javascript
{
  name: String,
  email: String,
  password: String,
  role: { type: String, default: "Admin" },
  school: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}
```

### Student Schema

```javascript
{
  name: String,
  email: String,
  password: String,
  role: { type: String, default: "Student" },
  school: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  rollNum: Number,
  sclassName: { type: mongoose.Schema.Types.ObjectId, ref: "Sclass" },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
  attendance: [{ date: Date, status: String }],
  gender: String,
  dob: Date,
  createdAt: { type: Date, default: Date.now }
}
```

### Teacher Schema

```javascript
{
  name: String,
  email: String,
  password: String,
  role: { type: String, default: "Teacher" },
  school: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  teachSubject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  teachSclass: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sclass" }],
  createdAt: { type: Date, default: Date.now }
}
```

### Class Schema

```javascript
{
  sclassName: String,
  school: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  createdAt: { type: Date, default: Date.now }
}
```

### Subject Schema

```javascript
{
  subName: String,
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sclass" }],
  school: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  createdAt: { type: Date, default: Date.now }
}
```

### Assignment Schema

```javascript
{
  title: String,
  description: String,
  subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  sclassName: { type: mongoose.Schema.Types.ObjectId, ref: "Sclass" },
  dueDate: Date,
  maxMarks: Number,
  school: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  createdAt: { type: Date, default: Date.now }
}
```

### Message Schema

```javascript
{
  sender: {
    id: mongoose.Schema.Types.ObjectId,
    model: String  // "Admin", "Teacher", or "Student"
  },
  receiver: {
    id: mongoose.Schema.Types.ObjectId,
    model: String
  },
  content: String,
  attachments: [String],
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}
```

---

## 9. User Roles and Permissions

EduSphere implements a role-based access control system with three primary user roles:

### Admin

**Permissions**:

- Create and manage school profile
- Add, edit, and remove teachers and students
- Create and manage classes and subjects
- Assign teachers to classes and subjects
- Generate and view reports
- Send notices and announcements
- Manage system settings
- Access all system features

### Teacher

**Permissions**:

- View assigned classes and subjects
- Create and manage assignments
- Take attendance for assigned classes
- Grade student submissions
- Communicate with students and admins
- View student performance in assigned subjects
- Create learning resources
- Manage their profile

### Student

**Permissions**:

- View assigned classes and subjects
- View and submit assignments
- Access learning resources
- View attendance and grades
- Communicate with teachers and admin
- View notices and announcements
- Manage their profile

### Authorization Implementation

- JWT-based authentication
- Role checking middleware
- Protected routes in frontend and backend
- Conditional rendering based on user role

---

## 10. Key Features

### Admin Dashboard

- School statistics and performance metrics
- User management (teachers and students)
- Class and subject management
- System-wide announcements
- Reports and analytics

### Teacher Features

- Class management
- Attendance tracking
- Assignment creation and grading
- Performance analytics
- Resource sharing

### Student Features

- Class schedule view
- Assignment submission
- Grade tracking
- Attendance records
- Learning resource access

### Common Features

- User authentication
- Profile management
- Messaging system
- Notifications
- Responsive design for mobile and desktop

---

## 11. API Documentation

### Authentication Endpoints

- `POST /api/login`: Authenticate user and return JWT
- `POST /api/registerAdmin`: Register new admin
- `GET /api/auth/verify`: Verify JWT token

### Admin Endpoints

- `GET /api/admin/students`: Get all students
- `POST /api/admin/student/add`: Add new student
- `DELETE /api/admin/student/delete/:id`: Delete student
- `GET /api/admin/teachers`: Get all teachers
- `POST /api/admin/teacher/add`: Add new teacher
- `DELETE /api/admin/teacher/delete/:id`: Delete teacher

### Class Endpoints

- `GET /api/class/getClasses/:id`: Get classes for a school
- `POST /api/class/addclass`: Create new class
- `DELETE /api/class/delete/:id`: Delete class

### Subject Endpoints

- `GET /api/subject/getSubjects/:id`: Get subjects for a school
- `POST /api/subject/addsubject`: Create new subject
- `DELETE /api/subject/delete/:id`: Delete subject

### Assignment Endpoints

- `GET /api/assignment/getAssignments/:id`: Get assignments for a school
- `POST /api/assignment/addassignment`: Create new assignment
- `DELETE /api/assignment/delete/:id`: Delete assignment

### Messaging Endpoints

- `GET /api/message/get/:receiverId/:receiverModel`: Get messages for a user
- `POST /api/message/send`: Send a message
- `PUT /api/message/markAsRead/:id`: Mark message as read

---

## 12. State Management

EduSphere uses Redux with Redux Toolkit for centralized state management:

### Store Configuration

The main Redux store is configured in `frontend/src/redux/store.js`, combining multiple reducers for different features.

### Slices

Feature-specific state logic is organized into slices:

- `userSlice.js`: Authentication state
- `adminSlice.js`: Admin-related state
- `teacherSlice.js`: Teacher-related state
- `studentSlice.js`: Student-related state
- `sclassSlice.js`: Class-related state
- `subjectSlice.js`: Subject-related state
- `assignmentSlice.js`: Assignment-related state
- `messageSlice.js`: Messaging state
- `noticeSlice.js`: Notice state
- `resourceSlice.js`: Resource state

### API Handlers

Asynchronous API calls are handled in separate files using Redux Toolkit's `createAsyncThunk`:

- `userHandle.js`: Authentication API calls
- `adminHandle.js`: Admin-related API calls
- `teacherHandle.js`: Teacher-related API calls
- `studentHandle.js`: Student-related API calls
- `sclassHandle.js`: Class-related API calls
- `subjectHandle.js`: Subject-related API calls
- `assignmentHandle.js`: Assignment-related API calls
- `messageHandle.js`: Messaging API calls

### State Access Pattern

Components access Redux state through the `useSelector` hook and dispatch actions using the `useDispatch` hook.

---

## 13. Authentication and Authorization

### Authentication Flow

1. User submits login credentials (email/password)
2. Backend validates credentials against database
3. If valid, JWT token is generated and sent to client
4. Frontend stores token in local storage
5. Token is included in Authorization header for subsequent API requests
6. Backend middleware validates token for protected routes

### JWT Implementation

- Tokens include user ID, role, and expiration
- Token expiration set to 24 hours
- Refresh token mechanism for extended sessions

### Protected Routes

- Frontend: React Router with custom `AuthCheck` component
- Backend: JWT verification middleware

### Password Security

- Passwords hashed using bcrypt before storage
- Minimum password strength requirements enforced

---

## 14. Messaging System

EduSphere includes a comprehensive messaging system for communication between users:

### Features

- Direct messaging between users (admin, teachers, students)
- Group messaging for classes
- Notification for new messages
- Read status tracking
- Message history

### Implementation

- Messages stored in MongoDB using `messageSchema`
- Real-time updates using Socket.io
- Messages organized by sender and receiver
- Support for text-based messages with future expansion for attachments

### User Interface

- Chat interface with conversation history
- Unread message indicators
- Message composition with rich text support
- User search and selection

---

## 15. Real-time Features

EduSphere implements real-time functionality using Socket.io:

### Implemented Features

- Instant messaging
- Notification delivery
- Online status indicators

### Socket.io Setup

- Backend initialization in `index.js`
- Client connection in frontend components
- Event listeners for various real-time updates

### Event Types

- `message`: New message notification
- `notice`: System-wide announcement
- `assignment`: New assignment notification
- `grade`: Grade update notification

---

## 16. Data Visualization

EduSphere uses Recharts for data visualization:

### Types of Visualizations

- Bar charts for performance comparison
- Pie charts for attendance statistics
- Line charts for performance trends
- Area charts for participation metrics

### Implementation

- Chart components in `frontend/src/components`
- Data processing utilities in `frontend/src/utils`
- Dynamic data loading from Redux store
- Responsive design for different screen sizes

### Dashboard Analytics

- Admin: School-wide statistics
- Teacher: Class and subject performance
- Student: Personal performance trends

---

## 17. Deployment Guide

### Backend Deployment (Node.js)

1. Set up environment variables for production
2. Install PM2 for process management
3. Configure NGINX as a reverse proxy
4. Set up SSL certificate
5. Deploy to VPS or cloud service (AWS, DigitalOcean, etc.)

### Frontend Deployment (React)

1. Build production bundle: `npm run build`
2. Deploy static files to CDN or hosting service (Netlify, Vercel, etc.)
3. Configure environment variables for production API endpoint

### Database Deployment (MongoDB)

1. Set up MongoDB Atlas cluster
2. Configure network access and database users
3. Update connection string in backend environment variables

### Continuous Integration/Deployment

1. Set up GitHub Actions or similar CI/CD pipeline
2. Configure automatic testing and deployment on push
3. Implement staging environment for pre-production testing

---

## 18. Troubleshooting

### Common Issues and Solutions

#### Backend Connection Issues

- Check MongoDB connection string
- Verify network connectivity
- Ensure correct environment variables

#### Authentication Problems

- Check JWT secret consistency
- Verify token expiration settings
- Clear browser storage and try again

#### Data Not Loading

- Check Redux state configuration
- Verify API endpoint correctness
- Check for CORS issues

#### Performance Issues

- Implement database indexing
- Optimize React component rendering
- Enable server-side caching

### Debugging Tools

- Redux DevTools for state inspection
- React Developer Tools for component debugging
- MongoDB Compass for database inspection
- Network tab in browser dev tools for API debugging

---

## 19. Future Enhancements

### Planned Features

- Mobile application using React Native
- Advanced analytics and reporting
- Parent portal for student guardians
- Online examination system
- Learning management system integration
- Fee management module
- Library management module
- Transport management module

### Technical Improvements

- Implement GraphQL API
- Migrate to TypeScript
- Enhance test coverage
- Implement microservices architecture
- Add progressive web app (PWA) capabilities

---

## 20. Conclusion

EduSphere - School Management System provides a comprehensive solution for educational institutions to manage their administrative and academic operations efficiently. With its user-friendly interface, robust features, and scalable architecture, EduSphere aims to transform the way schools operate in the digital age.

The system's modular design allows for future expansion and customization to meet the evolving needs of educational institutions. By leveraging modern web technologies and following best practices in software development, EduSphere delivers a reliable, secure, and performant platform for school management.

---

© 2025 EduSphere. All Rights Reserved.
