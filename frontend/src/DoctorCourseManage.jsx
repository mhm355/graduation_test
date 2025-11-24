import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, Box, Paper, Tabs, Tab, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from "@mui/material";
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

    // Upload Dialog States
    const [openUpload, setOpenUpload] = useState(false);
    const [file, setFile] = useState(null);
    const [materialTitle, setMaterialTitle] = useState("");
    const [uploadMsg, setUploadMsg] = useState(null);

    useEffect(() => {
        fetchCourseDetails();
        fetchGrades();
        fetchAttendance();
        fetchMaterials();
    }, [id]);

    const getAuth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } });

    const fetchCourseDetails = async () => {
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

    // --- MATERIAL UPLOAD LOGIC ---
    const handleUploadSubmit = async () => {
        if (!file || !materialTitle) return;

        const formData = new FormData();
        formData.append("course_code", course.code); // Use the code from the loaded course
        formData.append("title", materialTitle);
        formData.append("file", file);

        try {
            const token = localStorage.getItem("access_token");
            await axios.post("/api/upload-material/", formData, {
                headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` }
            });
            setUploadMsg({ type: "success", text: "Material uploaded successfully!" });
            setTimeout(() => {
                setOpenUpload(false);
                fetchMaterials(); // Refresh list
                setFile(null);
                setMaterialTitle("");
                setUploadMsg(null);
            }, 1500);
        } catch (err) {
            setUploadMsg({ type: "error", text: "Upload failed. Check permissions." });
        }
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
                        <Button
                            variant="contained"
                            startIcon={<CloudUploadIcon />}
                            onClick={() => setOpenUpload(true)}
                        >
                            Upload New Material
                        </Button>
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

            {/* --- UPLOAD DIALOG --- */}
            <Dialog open={openUpload} onClose={() => setOpenUpload(false)} fullWidth maxWidth="sm">
                <DialogTitle>Upload Material</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus margin="dense" label="Material Title" fullWidth variant="outlined"
                        value={materialTitle} onChange={(e) => setMaterialTitle(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Button component="label" variant="outlined" fullWidth startIcon={<CloudUploadIcon />}>
                        {file ? file.name : "Select PDF File"}
                        <input type="file" hidden accept=".pdf,.doc,.ppt" onChange={(e) => setFile(e.target.files[0])} />
                    </Button>
                    {uploadMsg && <Alert severity={uploadMsg.type} sx={{ mt: 2 }}>{uploadMsg.text}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenUpload(false)}>Cancel</Button>
                    <Button onClick={handleUploadSubmit} variant="contained">Upload</Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
}