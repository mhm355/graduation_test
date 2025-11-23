import { useEffect, useState } from "react";
import { Container, Typography, Box, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchMyGrades } from "./services/api"; // <--- The secure API call

export default function Grades() {
    const navigate = useNavigate();
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadGrades = async () => {
            try {
                const data = await fetchMyGrades();
                setGrades(data);
            } catch (error) {
                console.error("Error loading grades:", error);
            } finally {
                setLoading(false);
            }
        };
        loadGrades();
    }, []);

    // Helper to color-code the grades
    const getGradeColor = (letter) => {
        if (letter.startsWith('A')) return "success";
        if (letter.startsWith('B')) return "primary";
        if (letter.startsWith('C')) return "warning";
        return "error";
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Button onClick={() => navigate("/dashboard")} sx={{ mb: 2 }}>
                ← Back to Dashboard
            </Button>

            <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
                My Grades
            </Typography>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                        <TableRow>
                            <TableCell><strong>Course Code</strong></TableCell>
                            <TableCell><strong>Course Name</strong></TableCell>
                            <TableCell><strong>Semester</strong></TableCell>
                            <TableCell align="center"><strong>Score</strong></TableCell>
                            <TableCell align="center"><strong>Grade</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {grades.map((grade) => (
                            <TableRow key={grade.id}>
                                <TableCell>{grade.course_code}</TableCell>
                                <TableCell>{grade.course_name}</TableCell>
                                <TableCell>{grade.semester}</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>{grade.score}%</TableCell>
                                <TableCell align="center">
                                    <Chip
                                        label={grade.letter_grade}
                                        color={getGradeColor(grade.letter_grade)}
                                        size="small"
                                        sx={{ fontWeight: "bold", minWidth: "40px" }}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}

                        {/* Show message if empty */}
                        {!loading && grades.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    <Typography color="textSecondary">No grades found yet.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
}