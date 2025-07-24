import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import Homepage from './pages/Homepage';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import LoginPage from './pages/LoginPage';
import AdminRegisterPage from './pages/admin/AdminRegisterPage';
import ChooseUser from './pages/ChooseUser';
import AuthCheck from './components/AuthCheck';

const App = () => {
  const { currentRole } = useSelector(state => state.user);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Set auth checked to true after a short delay 
    // This ensures our AuthCheck component has time to run
    const timer = setTimeout(() => {
      setAuthChecked(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      {/* Component to check for stored authentication */}
      <AuthCheck />
      
      {/* Show routes only after auth check has completed */}
      {authChecked && (
        <>
          {currentRole === null &&
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/choose" element={<ChooseUser visitor="normal" />} />
              <Route path="/chooseasguest" element={<ChooseUser visitor="guest" />} />

              <Route path="/Adminlogin" element={<LoginPage role="Admin" />} />
              <Route path="/Studentlogin" element={<LoginPage role="Student" />} />
              <Route path="/Teacherlogin" element={<LoginPage role="Teacher" />} />

              <Route path="/Adminregister" element={<AdminRegisterPage />} />

              <Route path='*' element={<Navigate to="/" />} />
            </Routes>}

          {currentRole === "Admin" &&
            <>
              <AdminDashboard />
            </>
          }

          {currentRole === "Student" &&
            <>
              <StudentDashboard />
            </>
          }

          {currentRole === "Teacher" &&
            <>
              <TeacherDashboard />
            </>
          }
        </>
      )}
    </Router>
  )
}

export default App