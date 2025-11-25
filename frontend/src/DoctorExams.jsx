import { useState, useEffect } from "react";
import { Container, Typography, Box, Paper, Button, Grid, TextField, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function DoctorExams() {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [myCourses, setMyCourses] = useState([]);

    // Form State
    const [selectedCourse, setSelectedCourse] = useState("");
    const [type, setType] = useState("Midterm");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [location, setLocation] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const getAuth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } });

    const fetchData = async () => {
        try {
            // 1. Get Exams
            const resExams = await axios.get("/api/doctor/exams/", getAuth());
            setExams(resExams.data);

            // 2. Get Courses (for the dropdown)
            const resCourses = await axios.get("/api/doctor/courses/", getAuth());
            setMyCourses(resCourses.data);
        } catch (err) { console.error(err); }
    };

    const handleCreate = async () => {
        if (!selectedCourse || !date || !time || !location) return alert("Fill all fields");

        try {
            await axios.post("/api/doctor/exams/", {
                course: selectedCourse,
                exam_type: type,
                date,
                time,
                location
            }, getAuth());
            fetchData(); // Refresh list
            alert("Exam Scheduled!");
        } catch (err) { alert("Failed to schedule exam."); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Cancel this exam?")) return;
        try {
            await axios.delete(`/api/doctor/exams/${id}/delete/`, getAuth());
            setExams(prev => prev.filter(e => e.id !== id));
        } catch (err) { alert("Failed to delete"); }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/doctor-dashboard")} sx={{ mb: 2 }}>Back</Button>
            <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>Exam Scheduler</Typography>

            <Grid container spacing={4}>
                {/* LEFT: FORM */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Schedule New Exam</Typography>

                        <TextField
                            select label="Course" fullWidth margin="dense"
                            value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            {myCourses.map(c => <MenuItem key={c.id} value={c.id}>{c.code} - {c.name}</MenuItem>)}
                        </TextField>

                        <TextField
                            select label="Type" fullWidth margin="dense"
                            value={type} onChange={(e) => setType(e.target.value)}
                        >
                            <MenuItem value="Midterm">Midterm</MenuItem>
                            <MenuItem value="Final">Final</MenuItem>
                            <MenuItem value="Quiz">Quiz</MenuItem>
                        </TextField>

                        <TextField type="date" label="Date" fullWidth margin="dense" InputLabelProps={{ shrink: true }} value={date} onChange={(e) => setDate(e.target.value)} />
                        <TextField type="time" label="Time" fullWidth margin="dense" InputLabelProps={{ shrink: true }} value={time} onChange={(e) => setTime(e.target.value)} />
                        <TextField label="Location (e.g. Hall 1)" fullWidth margin="dense" value={location} onChange={(e) => setLocation(e.target.value)} />

                        <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleCreate}>Schedule Exam</Button>
                    </Paper>
                </Grid>

                {/* RIGHT: LIST */}
                <Grid item xs={12} md={8}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead sx={{ bgcolor: "#eee" }}>
                                <TableRow>
                                    <TableCell>Course</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Date & Time</TableCell>
                                    <TableCell>Location</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {exams.map(e => (
                                    <TableRow key={e.id}>
                                        <TableCell>{e.course_code}</TableCell>
                                        <TableCell>{e.exam_type}</TableCell>
                                        <TableCell>{e.date} at {e.time}</TableCell>
                                        <TableCell>{e.location}</TableCell>
                                        <TableCell>
                                            <IconButton color="error" onClick={() => handleDelete(e.id)}><DeleteIcon /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {exams.length === 0 && <TableRow><TableCell colSpan={5} align="center">No upcoming exams.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </Container>
    );
}