import { useState } from "react";
import { Container, Typography, Paper, Button, Alert, LinearProgress, Box } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate, useLocation } from "react-router-dom"; // <--- Added useLocation
import axios from "axios";

export default function StudentRegistration() {
    const navigate = useNavigate();
    const location = useLocation(); // <--- Hook to read the passed state

    // Extract the data passed from the Staff Dashboard
    const { dept, year, level } = location.state || {};

    const [file, setFile] = useState(null);
    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const token = localStorage.getItem("access_token");
            // Matches the backend API we built
            const res = await axios.post("/api/upload-students/", formData, {
                headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` }
            });
            setMsg({ type: "success", text: res.data.status });
        } catch (err) {
            console.error(err);
            setMsg({ type: "error", text: "Upload failed. Check your Excel format." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Button onClick={() => navigate("/staff-dashboard")} sx={{ mb: 2 }}>← Back to Dashboard</Button>

            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
                    Register New Students
                </Typography>

                {/* --- CONTEXT ALERT START --- */}
                {/* If we arrived here from the dashboard, show the context */}
                {dept && year && level ? (
                    <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                        Uploading list for: <br />
                        <strong>{dept}</strong> &mdash; <strong>{year}</strong> &mdash; <strong>{level}</strong>
                    </Alert>
                ) : (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        Warning: You did not select a level from the dashboard.
                    </Alert>
                )}
                {/* --- CONTEXT ALERT END --- */}

                <Typography variant="body2" color="textSecondary" mb={3} sx={{ bgcolor: "#f5f5f5", p: 1, borderRadius: 1 }}>
                    Required Excel Columns:<br />
                    <b>department | level | semester | student_id | student_name</b>
                </Typography>

                <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2, height: 50 }}
                >
                    {file ? file.name : "Select Excel File (.xlsx)"}
                    <input type="file" hidden onChange={(e) => setFile(e.target.files[0])} accept=".xlsx" />
                </Button>

                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleUpload}
                    disabled={loading || !file}
                >
                    {loading ? "Processing..." : "Upload & Register"}
                </Button>

                {loading && <LinearProgress sx={{ mt: 2 }} />}

                {msg && <Alert severity={msg.type} sx={{ mt: 2 }}>{msg.text}</Alert>}
            </Paper>
        </Container>
    );
}