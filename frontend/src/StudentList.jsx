import { useEffect, useState } from "react";
import { Container, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function StudentList() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Context from Dashboard
  const { dept, year, level } = location.state || {};

  const [students, setStudents] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editName, setEditName] = useState("");
  const [editId, setEditId] = useState("");

  useEffect(() => {
    if (dept && level) fetchStudents();
  }, [dept, level]);

  const fetchStudents = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await axios.get(`/api/students/?dept=${dept}&level=${level}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This will delete the student account.")) return;
    const token = localStorage.getItem("access_token");
    try {
      await axios.delete(`/api/students/${id}/manage/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err) { alert("Failed to delete"); }
  };

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setEditName(student.first_name);
    setEditId(student.username);
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    const token = localStorage.getItem("access_token");
    try {
      await axios.put(`/api/students/${selectedStudent.id}/manage/`, 
        { first_name: editName, username: editId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditOpen(false);
      fetchStudents(); // Refresh list
    } catch (err) { alert("Update failed"); }
  };

  if (!dept) return <Typography p={4}>Please select a level from the Dashboard first.</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/staff-dashboard")} sx={{ mb: 2 }}>
        Back to Dashboard
      </Button>

      <Box mb={3}>
        <Typography variant="h4" color="primary" fontWeight="bold">Student List</Typography>
        <Typography variant="h6" color="textSecondary">
          {dept} &mdash; {year} &mdash; {level}
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "#eee" }}>
            <TableRow>
              <TableCell><strong>Student ID</strong></TableCell>
              <TableCell><strong>Full Name</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.username}</TableCell>
                <TableCell>{student.first_name}</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleEditClick(student)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(student.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {students.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 3 }}>No students found. Please upload a list.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Student</DialogTitle>
        <DialogContent>
          <TextField 
            label="Student ID" fullWidth margin="dense" 
            value={editId} onChange={(e) => setEditId(e.target.value)} 
          />
          <TextField 
            label="Full Name" fullWidth margin="dense" 
            value={editName} onChange={(e) => setEditName(e.target.value)} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}