import { useState } from "react";
import axios from "axios";
import { Container, Typography, Paper, Button, TextField, Alert, Box } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate } from "react-router-dom";

export default function UploadCertificate() {
    const navigate = useNavigate();
    const [studentId, setStudentId] = useState("");
    const [file, setFile] = useState(null);
    const [msg, setMsg] = useState(null);

    const handleUpload = async () => {
        if (!file || !studentId) return;

        const formData = new FormData();
        formData.append("student_id", studentId);
        formData.append("file", file);

        try {
            const token = localStorage.getItem("access_token");
            await axios.post("/api/upload-certificate/", formData, {
                headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` }
            });
            setMsg({ type: "success", text: "Certificate uploaded!" });
        } catch (err) {
            setMsg({ type: "error", text: "Upload failed. Check Student ID." });
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Button onClick={() => navigate("/staff-dashboard")} sx={{ mb: 2 }}>← Back</Button>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
                    Upload Graduation Certificate
                </Typography>

                <TextField
                    label="Student ID"
                    fullWidth
                    variant="outlined"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    sx={{ mb: 3, mt: 2 }}
                />

                <Button component="label" variant="outlined" fullWidth startIcon={<CloudUploadIcon />} sx={{ mb: 3, height: 50 }}>
                    {file ? file.name : "Select PDF Certificate"}
                    <input type="file" hidden accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
                </Button>

                <Button variant="contained" fullWidth size="large" onClick={handleUpload} disabled={!file || !studentId}>
                    Upload
                </Button>

                {msg && <Alert severity={msg.type} sx={{ mt: 2 }}>{msg.text}</Alert>}
            </Paper>
        </Container>
    );
}