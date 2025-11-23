import { useEffect, useState } from "react";
import { Container, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchAllGrades, updateGrade } from "./services/api";

export default function DoctorGrades() {
    const navigate = useNavigate();
    const [grades, setGrades] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState(null);
    const [newScore, setNewScore] = useState("");

    useEffect(() => {
        loadGrades();
    }, []);

    const loadGrades = async () => {
        const data = await fetchAllGrades();
        setGrades(data);
    };

    const handleEditClick = (grade) => {
        setSelectedGrade(grade);
        setNewScore(grade.score);
        setOpen(true);
    };

    const handleSave = async () => {
        if (selectedGrade) {
            await updateGrade(selectedGrade.id, newScore);
            setOpen(false);
            loadGrades(); // Refresh table
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Button onClick={() => navigate("/doctor-dashboard")} sx={{ mb: 2 }}>← Back</Button>
            <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>Student Gradebook</Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: "#eee" }}>
                        <TableRow>
                            <TableCell><strong>Student</strong></TableCell>
                            <TableCell><strong>Course</strong></TableCell>
                            <TableCell><strong>Semester</strong></TableCell>
                            <TableCell><strong>Score</strong></TableCell>
                            <TableCell><strong>Action</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {grades.map((grade) => (
                            <TableRow key={grade.id}>
                                {/* Note: In real app, you'd serialize student name too */}
                                <TableCell>Student ID: {grade.student}</TableCell>
                                <TableCell>{grade.course_code}</TableCell>
                                <TableCell>{grade.semester}</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>{grade.score}</TableCell>
                                <TableCell>
                                    <Button size="small" variant="contained" onClick={() => handleEditClick(grade)}>
                                        Edit
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Edit Dialog (Popup) */}
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Edit Grade</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="New Score"
                        type="number"
                        fullWidth
                        value={newScore}
                        onChange={(e) => setNewScore(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}