import { useEffect, useState } from "react";
import { Container, Typography, Button, Grid, Card, CardContent, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, List, ListItem, ListItemText, IconButton, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';

export default function DoctorCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  
  // State for Upload Dialog
  const [openUpload, setOpenUpload] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [file, setFile] = useState(null);
  const [materialTitle, setMaterialTitle] = useState("");
  const [msg, setMsg] = useState(null);

  // State for "Manage Files" Dialog
  const [openFiles, setOpenFiles] = useState(false);
  const [courseFiles, setCourseFiles] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await axios.get("/api/doctor/courses/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(res.data);
    } catch (err) { console.error(err); }
  };

  // --- 1. VIEW FILES LOGIC ---
  const handleViewFiles = async (course) => {
    setSelectedCourse(course);
    const token = localStorage.getItem("access_token");
    try {
      // Reuse the existing API to get materials
      const res = await axios.get(`/api/courses/${course.id}/materials/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourseFiles(res.data);
      setOpenFiles(true);
    } catch (err) { console.error("Failed to load files"); }
  };

  // --- 2. DELETE FILE LOGIC ---
  const handleDeleteFile = async (fileId) => {
    if(!window.confirm("Are you sure you want to delete this file?")) return;

    const token = localStorage.getItem("access_token");
    try {
      await axios.delete(`/api/material/${fileId}/delete/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh the list immediately
      setCourseFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (err) { alert("Failed to delete"); }
  };

  // --- 3. UPLOAD LOGIC (Existing) ---
  const handleUploadClick = (course) => {
    setSelectedCourse(course);
    setOpenUpload(true);
    setMsg(null);
  };

  const handleUploadSubmit = async () => {
    if (!file || !materialTitle) return;
    const formData = new FormData();
    formData.append("course_code", selectedCourse.code);
    formData.append("title", materialTitle);
    formData.append("file", file);

    try {
      const token = localStorage.getItem("access_token");
      await axios.post("/api/upload-material/", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` }
      });
      setMsg({ type: "success", text: "Success!" });
      setTimeout(() => { setOpenUpload(false); fetchCourses(); }, 1000);
    } catch (err) { setMsg({ type: "error", text: "Upload failed." }); }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Button onClick={() => navigate("/doctor-dashboard")} sx={{ mb: 2 }}>← Back</Button>
      <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>My Assigned Courses</Typography>

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} md={6} key={course.id}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="overline" color="textSecondary">{course.code}</Typography>
                <Typography variant="h5" fontWeight="bold" gutterBottom>{course.name}</Typography>
                
                <Box mb={3}>
                  <Chip label={`${course.credit_hours} Credits`} size="small" sx={{ mr: 1 }} />
                  <Chip label={course.department_name} color="primary" size="small" variant="outlined" />
                </Box>

                <Box display="flex" gap={2}>
                  <Button 
                    variant="contained" 
                    startIcon={<CloudUploadIcon />}
                    onClick={() => handleUploadClick(course)}
                    fullWidth
                  >
                    Upload
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<FolderIcon />}
                    onClick={() => handleViewFiles(course)}
                    fullWidth
                  >
                    Manage Files
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* --- DIALOG 1: UPLOAD --- */}
      <Dialog open={openUpload} onClose={() => setOpenUpload(false)} fullWidth maxWidth="sm">
        <DialogTitle>Upload Material for {selectedCourse?.code}</DialogTitle>
        <DialogContent>
          <TextField 
            autoFocus margin="dense" label="Material Title" fullWidth variant="outlined" 
            value={materialTitle} onChange={(e) => setMaterialTitle(e.target.value)} sx={{ mb: 2 }}
          />
          <Button component="label" variant="outlined" fullWidth startIcon={<CloudUploadIcon />}>
            {file ? file.name : "Select PDF File"}
            <input type="file" hidden accept=".pdf,.doc,.ppt" onChange={(e) => setFile(e.target.files[0])} />
          </Button>
          {msg && <Alert severity={msg.type} sx={{ mt: 2 }}>{msg.text}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpload(false)}>Cancel</Button>
          <Button onClick={handleUploadSubmit} variant="contained">Upload</Button>
        </DialogActions>
      </Dialog>

      {/* --- DIALOG 2: MANAGE FILES --- */}
      <Dialog open={openFiles} onClose={() => setOpenFiles(false)} fullWidth maxWidth="sm">
        <DialogTitle>Files: {selectedCourse?.name}</DialogTitle>
        <DialogContent>
          <List>
            {courseFiles.map((file) => (
              <div key={file.id}>
                <ListItem
                  secondaryAction={
                    <IconButton edge="end" color="error" onClick={() => handleDeleteFile(file.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText 
                    primary={file.title} 
                    secondary={`Uploaded: ${new Date(file.uploaded_at).toLocaleDateString()}`} 
                  />
                </ListItem>
                <Divider />
              </div>
            ))}
            {courseFiles.length === 0 && <Typography sx={{ p: 2, color: 'gray' }}>No files yet.</Typography>}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFiles(false)}>Close</Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}