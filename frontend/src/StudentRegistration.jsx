import { useState } from "react";
import { Container, Typography, Box, Paper, Button, Alert, LinearProgress } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function StudentRegistration() {
    const navigate = useNavigate();
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
            const res = await axios.post("/api/upload-students/", formData, {
                headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` }
            });
            setMsg({ type: "success", text: res.data.status });
        } catch (err) {
            setMsg({ type: "error", text: "Upload failed. Check Excel format." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Button onClick={() => navigate("/staff-dashboard")} sx={{ mb: 2 }}>← Back</Button>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
                    Register New Students
                </Typography>
                <Typography variant="body2" color="textSecondary" mb={3}>
                    Upload Excel: <b>student_id | student_name | national_id</b>
                </Typography>

                <Button component="label" variant="outlined" fullWidth startIcon={<CloudUploadIcon />} sx={{ mb: 2 }}>
                    {file ? file.name : "Select Student List (.xlsx)"}
                    <input type="file" hidden onChange={(e) => setFile(e.target.files[0])} accept=".xlsx" />
                </Button>

                <Button variant="contained" fullWidth onClick={handleUpload} disabled={loading || !file}>
                    {loading ? "Processing..." : "Upload & Register"}
                </Button>

                {loading && <LinearProgress sx={{ mt: 2 }} />}
                {msg && <Alert severity={msg.type} sx={{ mt: 2 }}>{msg.text}</Alert>}
            </Paper>
        </Container>
    );
}