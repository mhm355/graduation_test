import { useState } from "react";
import axios from "axios";
import { Container, Typography, Button, Paper, Alert, LinearProgress } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate } from "react-router-dom";

export default function UploadGrades() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setStatus({ type: "", message: "" });
    };

    const handleUpload = async () => {
        if (!file) {
            setStatus({ type: "error", message: "Please select a file first." });
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const token = localStorage.getItem("access_token");
            // URL is relative because of Nginx
            const res = await axios.post("/api/upload-grades/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            setStatus({ type: "success", message: res.data.status });
        } catch (error) {
            console.error(error);
            // Display the specific error from Backend (e.g. "Missing column: score")
            const errorMsg = error.response?.data?.error || "Upload failed.";
            setStatus({ type: "error", message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Button onClick={() => navigate("/doctor/courses")} sx={{ mb: 2 }}>← Back to Courses</Button>

            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
                    Bulk Upload Grades
                </Typography>

                {/* UPDATED INSTRUCTIONS HERE */}
                <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                    <Typography variant="subtitle2" fontWeight="bold">Required Excel Columns:</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1 }}>
                        department | level | semester | course_name | student_id | student_name | score
                    </Typography>
                </Alert>

                <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2, width: "100%", height: "50px" }}
                >
                    {file ? file.name : "Select Excel File (.xlsx)"}
                    <input type="file" hidden onChange={handleFileChange} accept=".xlsx, .xls" />
                </Button>

                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleUpload}
                    disabled={loading || !file}
                    sx={{ py: 1.5, mb: 2 }}
                >
                    {loading ? "Uploading..." : "Submit Grades"}
                </Button>

                {loading && <LinearProgress sx={{ mb: 2 }} />}

                {status.message && (
                    <Alert severity={status.type}>{status.message}</Alert>
                )}
            </Paper>
        </Container>
    );
}