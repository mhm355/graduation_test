import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, Box, Paper, Tabs, Tab, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from "@mui/material";
import axios from "axios";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';

export default function DoctorCourseManage() {
    const { id } = useParams(); // Course ID
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [tabIndex, setTabIndex] = useState(0);

    // Data States
    const [grades, setGrades] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [materials, setMaterials] = useState([]);

    useEffect(() => {
        fetchCourseDetails();
        fetchGrades();
        fetchAttendance();
        fetchMaterials();
    }, [id]);

    const getAuth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } });

    const fetchCourseDetails = async () => {
        // We can reuse the doctor courses list and find this one, or fetch specifically. 
        // For simplicity, let's fetch all and filter (or assume we passed state).
        // Ideally, create a specific API: /api/courses/{id}/
        // Here we rely on the DoctorCourses list for context if passed, but fetching is safer.
        try {
            const res = await axios.get("/api/doctor/courses/", getAuth());
            const found = res.data.find(c => c.id === parseInt(id));
            setCourse(found);
        } catch (err) { console.error(err); }
    };

    const fetchGrades = async () => {
        try {
            const res = await axios.get(`/api/doctor/grades/?course_id=${id}`, getAuth());
            setGrades(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchAttendance = async () => {
        try {
            const res = await axios.get(`/api/doctor/attendance/?course_id=${id}`, getAuth());
            setAttendance(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchMaterials = async () => {
        try {
            const res = await axios.get(`/api/courses/${id}/materials/`, getAuth());
            setMaterials(res.data);
        } catch (err) { console.error(err); }
    };

    if (!course) return <Typography p={4}>Loading Course...</Typography>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Button onClick={() => navigate("/doctor/courses")} sx={{ mb: 2 }}>← Back to My Courses</Button>

            <Paper sx={{ p: 3, mb: 3, bgcolor: "#e3f2fd" }}>
                <Typography variant="h4" fontWeight="bold" color="primary">{course.name}</Typography>
                <Typography variant="h6" color="textSecondary">{course.code} &mdash; {course.department_name}</Typography>
            </Paper>

            {/* TABS NAVIGATION */}
            <Paper sx={{ mb: 3 }}>
                <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} indicatorColor="primary" textColor="primary" centered>
                    <Tab icon={<FolderIcon />} label="Materials" />
                    <Tab icon={<AssessmentIcon />} label="Grades" />
                    <Tab icon={<PeopleIcon />} label="Attendance" />
                </Tabs>
            </Paper>

            {/* TAB 1: MATERIALS */}
            {tabIndex === 0 && (
                <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Course Files</Typography>
                        {/* Re-use your upload logic/dialog here or link to a popup */}
                        <Button variant="contained" startIcon={<CloudUploadIcon />}>Upload New Material</Button>
                    </Box>
                    {materials.map(m => (
                        <Paper key={m.id} sx={{ p: 2, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                            <Typography>{m.title}</Typography>
                            <Typography variant="caption">{new Date(m.uploaded_at).toLocaleDateString()}</Typography>
                        </Paper>
                    ))}
                    {materials.length === 0 && <Typography color="textSecondary">No files uploaded.</Typography>}
                </Box>
            )}

            {/* TAB 2: GRADES */}
            {tabIndex === 1 && (
                <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Student Grades</Typography>
                        <Button variant="contained" color="secondary" onClick={() => navigate("/upload")}>Bulk Upload Excel</Button>
                    </Box>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead sx={{ bgcolor: "#eee" }}><TableRow><TableCell>Student</TableCell><TableCell>Score</TableCell><TableCell>Grade</TableCell></TableRow></TableHead>
                            <TableBody>
                                {grades.map(g => (
                                    <TableRow key={g.id}>
                                        <TableCell>{g.student}</TableCell>
                                        <TableCell>{g.score}</TableCell>
                                        <TableCell>{g.letter_grade}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* TAB 3: ATTENDANCE */}
            {tabIndex === 2 && (
                <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Attendance Log</Typography>
                        <Button variant="contained" color="success" onClick={() => navigate("/doctor/attendance")}>Bulk Upload Excel</Button>
                    </Box>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead sx={{ bgcolor: "#eee" }}><TableRow><TableCell>Date</TableCell><TableCell>Student</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                            <TableBody>
                                {attendance.map(a => (
                                    <TableRow key={a.id}>
                                        <TableCell>{a.date}</TableCell>
                                        <TableCell>{a.student}</TableCell>
                                        <TableCell>
                                            <Chip label={a.status} color={a.status === "Present" ? "success" : "error"} size="small" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

        </Container>
    );
}