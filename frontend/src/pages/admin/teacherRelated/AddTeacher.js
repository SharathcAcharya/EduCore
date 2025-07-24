import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectDetails } from '../../../redux/sclassRelated/sclassHandle';
import Popup from '../../../components/Popup';
import { registerUser } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { CircularProgress } from '@mui/material';

const AddTeacher = () => {
  const params = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const subjectID = params.id

  const { status, response, error } = useSelector(state => state.user);
  const { subjectDetails, subloading: isLoading, error: subjectError } = useSelector((state) => state.sclass);

  useEffect(() => {
    if (subjectID) {
      console.log("Fetching subject details for ID:", subjectID);
      dispatch(getSubjectDetails(subjectID, "Subject"));
    } else {
      console.error("No subject ID provided to AddTeacher component");
      setMessage("No subject selected. Please choose a subject first.");
      setShowPopup(true);
    }
  }, [dispatch, subjectID]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('')

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [loader, setLoader] = useState(false)

  // Check if subjectDetails is valid and has all required fields
  const isSubjectDetailsValid = subjectDetails && 
                              subjectDetails._id && 
                              subjectDetails.school && 
                              subjectDetails.sclassName && 
                              subjectDetails.sclassName._id;

  const role = "Teacher"
  const school = subjectDetails && subjectDetails.school
  const teachSubject = subjectDetails && subjectDetails._id
  const teachSclass = subjectDetails && subjectDetails.sclassName && subjectDetails.sclassName._id

  const fields = { name, email, password, role, school, teachSubject, teachSclass }

  const submitHandler = (event) => {
    event.preventDefault()
    
    console.log("Submit handler called with fields:", fields);
    
    // Validate all required fields are present
    if (!school) {
      console.error("Missing school ID");
      setMessage("Missing school information. Please try again.");
      setShowPopup(true);
      return;
    }
    
    if (!teachSubject) {
      console.error("Missing subject ID");
      setMessage("Missing subject information. Please try again.");
      setShowPopup(true);
      return;
    }
    
    if (!teachSclass) {
      console.error("Missing class ID");
      setMessage("Missing class information. Please try again.");
      setShowPopup(true);
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email address.");
      setShowPopup(true);
      return;
    }
    
    // Password strength validation
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      setShowPopup(true);
      return;
    }
    
    // Name validation
    if (name.trim().length < 3) {
      setMessage("Name must be at least 3 characters long.");
      setShowPopup(true);
      return;
    }
    
    setLoader(true)
    console.log("Registering teacher with fields:", fields);
    dispatch(registerUser(fields, role))
  }

  useEffect(() => {
    if (status === 'added') {
      console.log("Teacher added successfully");
      dispatch(underControl())
      navigate("/Admin/teachers")
    }
    else if (status === 'failed') {
      console.error("Teacher registration failed:", response);
      setMessage(response || "Registration failed. Please try again.")
      setShowPopup(true)
      setLoader(false)
    }
    else if (status === 'error') {
      console.error("Network or server error:", error);
      setMessage(error?.message || "Network Error. Please check your connection.")
      setShowPopup(true)
      setLoader(false)
    }
  }, [status, navigate, error, response, dispatch]);

  // Add debugging for subjectDetails
  useEffect(() => {
    if (subjectDetails) {
      console.log("Subject details loaded:", subjectDetails);
      console.log("School:", subjectDetails.school);
      console.log("Subject ID:", subjectDetails._id);
      console.log("Class details:", subjectDetails.sclassName);
    } else {
      console.log("No subject details available yet");
    }
  }, [subjectDetails]);

  if (isLoading) {
    return (
      <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <div style={{ marginLeft: '20px' }}>Loading subject details...</div>
      </div>
    );
  }

  if (subjectError) {
    return (
      <div className="error-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column' }}>
        <div style={{ color: 'red', fontSize: '1.25rem', marginBottom: '10px' }}>Error loading subject details</div>
        <div>{subjectError}</div>
        <button className="registerButton" onClick={() => navigate("/Admin/teachers/chooseclass")} style={{ marginTop: '20px' }}>
          Go Back
        </button>
      </div>
    );
  }

  if (!isSubjectDetailsValid) {
    return (
      <div className="error-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column' }}>
        <div style={{ color: 'red', fontSize: '1.25rem', marginBottom: '10px' }}>Invalid subject details</div>
        <div>Could not load the complete subject information needed to add a teacher.</div>
        <button className="registerButton" onClick={() => navigate("/Admin/teachers/chooseclass")} style={{ marginTop: '20px' }}>
          Go Back to Choose Class
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="register">
        <form className="registerForm" onSubmit={submitHandler}>
          <span className="registerTitle">Add Teacher</span>
          <br />
          <label>
            Subject : {subjectDetails && subjectDetails.subName}
          </label>
          <label>
            Class : {subjectDetails && subjectDetails.sclassName && subjectDetails.sclassName.sclassName}
          </label>
          <label>Name</label>
          <input className="registerInput" type="text" placeholder="Enter teacher's name..."
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name" required />

          <label>Email</label>
          <input className="registerInput" type="email" placeholder="Enter teacher's email..."
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email" required />

          <label>Password</label>
          <input className="registerInput" type="password" placeholder="Enter teacher's password..."
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password" required />

          <button className="registerButton" type="submit" disabled={loader}>
            {loader ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Register'
            )}
          </button>
        </form>
      </div>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </div>
  )
}

export default AddTeacher