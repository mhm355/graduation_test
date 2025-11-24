import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, Box, Paper, Tabs, Tab, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, IconButton } from "@mui/material";
import axios from "axios";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; // <--- NEW IMPORT

export default function DoctorCourseManage() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [materials, setMaterials] = useState([]);

  // Upload States
  const [openUpload, setOpenUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [materialTitle, setMaterialTitle] = useState("");
  const [uploadMsg, setUploadMsg] = useState(null);

  // --- NEW: Edit Grade States ---
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [newScore, setNewScore] = useState("");

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

  // --- FILE DELETE LOGIC ---
  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm("Delete this file?")) return;
    try {
        await axios.delete(`/api/material/${materialId}/delete/`, getAuth());
        setMaterials(prev => prev.filter(m => m.id !== materialId));
    } catch (err) { alert("Failed to delete."); }
  };

  // --- GRADE EDIT LOGIC (NEW) ---
  const handleEditGradeClick = (grade) => {
    setSelectedGrade(grade);
    setNewScore(grade.score);
    setOpenEdit(true);
  };

  const handleSaveGrade = async () => {
    if (!selectedGrade) return;
    try {
        // Call the API we made earlier: PUT /api/doctor/grades/<id>/update/
        await axios.put(`/api/doctor/grades/${selectedGrade.id}/update/`, 
            { score: newScore }, 
            getAuth()
        );
        setOpenEdit(false);
        fetchGrades(); // Refresh table to show new score
    } catch (err) { alert("Failed to update grade."); }
  };

  // --- MATERIAL UPLOAD LOGIC ---
  const handleUploadSubmit = async () => {
    if (!file || !materialTitle) return;
    const formData = new FormData();
    formData.append("course_code", course.code);
    formData.append("title", materialTitle);
    formData.append("file", file);

    try {
      const token = localStorage.getItem("access_token");
      await axios.post("/api/upload-material/", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` }
      });
      setUploadMsg({ type: "success", text: "Success!" });
      setTimeout(() => { setOpenUpload(false); fetchMaterials(); setFile(null); setMaterialTitle(""); }, 1000);
    } catch (err) { setUploadMsg({ type: "error", text: "Upload failed." }); }
  };

  if (!course) return <Typography p={4}>Loading...</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Button onClick={() => navigate("/doctor/courses")} sx={{ mb: 2 }}>← Back</Button>
      
      <Paper sx={{ p: 3, mb: 3, bgcolor: "#e3f2fd" }}>
        <Typography variant="h4" fontWeight="bold" color="primary">{course.name}</Typography>
        <Typography variant="h6" color="textSecondary">{course.code} &mdash; {course.department_name}</Typography>
      </Paper>

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
                <Button variant="contained" startIcon={<CloudUploadIcon />} onClick={() => setOpenUpload(true)}>Upload</Button>
            </Box>
            {materials.map(m => (
                <Paper key={m.id} sx={{ p: 2, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography fontWeight="bold">{m.title}</Typography>
                        <Typography variant="caption">{new Date(m.uploaded_at).toLocaleDateString()}</Typography>
                    </Box>
                    <IconButton color="error" onClick={() => handleDeleteMaterial(m.id)}><DeleteIcon /></IconButton>
                </Paper>
            ))}
        </Box>
      )}

      {/* TAB 2: GRADES (Updated) */}
          {tabIndex === 1 && (
              <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">Student Grades</Typography>
                      <Button variant="contained" color="secondary" onClick={() => navigate("/upload")}>Bulk Upload Excel</Button>
                  </Box>
                  <TableContainer component={Paper}>
                      <Table>
                          <TableHead sx={{ bgcolor: "#eee" }}>
                              <TableRow>
                                  {/* NEW HEADERS */}
                                  <TableCell><strong>ID</strong></TableCell>
                                  <TableCell><strong>Name</strong></TableCell>
                                  <TableCell><strong>Level</strong></TableCell>
                                  <TableCell><strong>Semester</strong></TableCell>
                                  <TableCell align="center"><strong>Score</strong></TableCell>
                                  <TableCell align="center"><strong>Grade</strong></TableCell>
                                  <TableCell><strong>Action</strong></TableCell>
                              </TableRow>
                          </TableHead>
                          <TableBody>
                              {grades.map(g => (
                                  <TableRow key={g.id}>
                                      {/* NEW DATA CELLS */}
                                      <TableCell>{g.student_id}</TableCell>
                                      <TableCell>{g.student_name}</TableCell>
                                      <TableCell>{g.level}</TableCell>
                                      <TableCell>{g.semester}</TableCell>

                                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>{g.score}</TableCell>
                                      <TableCell align="center">
                                          <Chip
                                              label={g.letter_grade}
                                              color={g.letter_grade === 'F' ? 'error' : 'success'}
                                              size="small"
                                          />
                                      </TableCell>
                                      <TableCell>
                                          <IconButton color="primary" size="small" onClick={() => handleEditGradeClick(g)}>
                                              <EditIcon />
                                          </IconButton>
                                      </TableCell>
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
              <TableHead sx={{ bgcolor: "#eee" }}>
                <TableRow>
                  {/* CHANGED HEADERS */}
                  <TableCell><strong>Student ID</strong></TableCell>
                  <TableCell><strong>Student Name</strong></TableCell>
                  <TableCell><strong>Attended</strong></TableCell>
                  <TableCell><strong>Total</strong></TableCell>
                  <TableCell><strong>Percentage</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendance.map(a => (
                  <TableRow key={a.id}>
                    {/* CHANGED DATA CELLS */}
                    <TableCell>{a.student_id || "ID?"}</TableCell>
                    <TableCell>{a.student_name || "Name?"}</TableCell>
                    <TableCell>{a.attended_lectures}</TableCell>
                    <TableCell>{a.total_lectures}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${a.percentage}%`}
                        color={a.percentage < 75 ? "error" : "success"}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* --- DIALOG 1: UPLOAD MATERIAL --- */}
      <Dialog open={openUpload} onClose={() => setOpenUpload(false)} fullWidth maxWidth="sm">
        <DialogTitle>Upload Material</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Title" fullWidth value={materialTitle} onChange={(e) => setMaterialTitle(e.target.value)} />
          <Button component="label" fullWidth sx={{ mt: 2 }}>{file ? file.name : "Select File"}<input type="file" hidden onChange={(e) => setFile(e.target.files[0])} /></Button>
          {uploadMsg && <Alert severity={uploadMsg.type} sx={{ mt: 2 }}>{uploadMsg.text}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpload(false)}>Cancel</Button>
          <Button onClick={handleUploadSubmit} variant="contained">Upload</Button>
        </DialogActions>
      </Dialog>

      {/* --- DIALOG 2: EDIT GRADE --- */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Edit Grade</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>Student: {selectedGrade?.student_name}</Typography>
          <TextField 
            autoFocus margin="dense" label="Score" type="number" fullWidth 
            value={newScore} onChange={(e) => setNewScore(e.target.value)} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleSaveGrade} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}