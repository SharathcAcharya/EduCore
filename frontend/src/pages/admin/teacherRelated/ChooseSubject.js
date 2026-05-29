import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Box, Table, TableBody, TableContainer, TableHead, Typography, Paper } from '@mui/material'
import { motion } from 'framer-motion';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import { useNavigate, useParams } from 'react-router-dom';
import { getTeacherFreeClassSubjects } from '../../../redux/sclassRelated/sclassHandle';
import { updateTeachSubject } from '../../../redux/teacherRelated/teacherHandle';
import { GreenButton, PurpleButton } from '../../../components/buttonStyles';

const ChooseSubject = ({ situation }) => {
    const params = useParams();
    const navigate = useNavigate()
    const dispatch = useDispatch();

    const [classID, setClassID] = useState("");
    const [teacherID, setTeacherID] = useState("");
    const [loader, setLoader] = useState(false)

    const { subjectsList, loading, error, response } = useSelector((state) => state.sclass);

    useEffect(() => {
        if (situation === "Norm") {
            console.log("Norm situation with params:", params);
            setClassID(params.id);
            const classID = params.id;
            dispatch(getTeacherFreeClassSubjects(classID));
        }
        else if (situation === "Teacher") {
            console.log("Teacher situation with params:", params);
            const { classID, teacherID } = params;
            setClassID(classID);
            setTeacherID(teacherID);
            dispatch(getTeacherFreeClassSubjects(classID));
        }
    }, [situation, params, dispatch]);

    if (loading) {
        return <div>Loading...</div>;
    } else if (response) {
        return <div>
            <h1>Sorry all subjects have teachers assigned already</h1>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <PurpleButton variant="contained"
                    onClick={() => navigate("/Admin/addsubject/" + classID)}>
                    Add Subjects
                </PurpleButton>
            </Box>
        </div>;
    } else if (error) {
        console.log(error)
    }

    const updateSubjectHandler = (teacherId, teachSubject) => {
        setLoader(true)
        dispatch(updateTeachSubject(teacherId, teachSubject))
        navigate("/Admin/teachers")
    }

    const MotionStyledTableRow = motion(StyledTableRow);

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }} className="glass">
            <Typography variant="h6" gutterBottom component="div">
                Choose a subject
            </Typography>
            <>
                <TableContainer component={Paper} elevation={3} className="glass" sx={{ borderRadius: '24px', overflow: 'hidden' }}>
                    <Table aria-label="sclasses table">
                        <TableHead>
                            <StyledTableRow>
                                <StyledTableCell></StyledTableCell>
                                <StyledTableCell align="center">Subject Name</StyledTableCell>
                                <StyledTableCell align="center">Subject Code</StyledTableCell>
                                <StyledTableCell align="center">Actions</StyledTableCell>
                            </StyledTableRow>
                        </TableHead>
                        <TableBody>
                            {Array.isArray(subjectsList) && subjectsList.length > 0 ? (
                                subjectsList.map((subject, index) => (
                                    <MotionStyledTableRow
                                        key={subject._id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03, duration: 0.28 }}
                                    >
                                        <StyledTableCell component="th" scope="row" style={{ color: "white" }}>
                                            {index + 1}
                                        </StyledTableCell>
                                        <StyledTableCell align="center">{subject.subName}</StyledTableCell>
                                        <StyledTableCell align="center">{subject.subCode}</StyledTableCell>
                                        <StyledTableCell align="center">
                                            {situation === "Norm" ?
                                                <GreenButton variant="contained"
                                                    onClick={() => navigate("/Admin/teachers/addteacher/" + subject._id)}>
                                                    Choose
                                                </GreenButton>
                                                :
                                                <GreenButton variant="contained" disabled={loader}
                                                    onClick={() => updateSubjectHandler(teacherID, subject._id)}>
                                                    {loader ? (
                                                        <div className="load"></div>
                                                    ) : (
                                                        'Choose Sub'
                                                    )}
                                                </GreenButton>}
                                        </StyledTableCell>
                                    </MotionStyledTableRow>
                                ))
                            ) : (
                                <StyledTableRow>
                                    <StyledTableCell colSpan={4} align="center">
                                        No subjects available. Please add subjects first.
                                    </StyledTableCell>
                                </StyledTableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </>
        </Paper >
    );
};

export default ChooseSubject;