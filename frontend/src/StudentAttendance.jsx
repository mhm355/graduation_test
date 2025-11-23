import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function StudentAttendance() {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);

    useEffect(() => {
        const fetchAtt = async () => {
            const token = localStorage.getItem("access_token");
            const res = await axios.get("/api/my-attendance/", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecords(res.data);
        };
        fetchAtt();
    }, []);

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Button onClick={() => navigate("/dashboard")} sx={{ mb: 2 }}>← Back</Button>
            <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>My Attendance</Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: "#eee" }}>
                        <TableRow>
                            <TableCell><strong>Date</strong></TableCell>
                            <TableCell><strong>Course</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {records.map((r) => (
                            <TableRow key={r.id}>
                                <TableCell>{r.date}</TableCell>
                                <TableCell>{r.course_code} - {r.course_name}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={r.status}
                                        color={r.status === "Present" ? "success" : "error"}
                                        size="small"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        {records.length === 0 && <TableRow><TableCell colSpan={3} align="center">No records found</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
}