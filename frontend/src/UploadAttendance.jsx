import { useState } from "react";
import axios from "axios";
import { Container, Typography, Button, Paper, Alert, LinearProgress } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function UploadAttendance() {
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
            // Note: Pointing to the NEW Attendance API
            await axios.post("/api/upload-attendance/", formData, {
                headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` }
            });
            setMsg({ type: "success", text: "Attendance sheet uploaded successfully!" });
        } catch (err) {
            setMsg({ type: "error", text: "Upload failed." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>Upload Attendance</Typography>
                <Typography variant="body2" color="textSecondary" mb={3}>
                    Columns required: student_id, course_code, date, status
                </Typography>

                <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} sx={{ mb: 2, width: "100%" }}>
                    {file ? file.name : "Select Excel File"}
                    <input type="file" hidden onChange={(e) => setFile(e.target.files[0])} accept=".xlsx" />
                </Button>

                <Button variant="contained" fullWidth onClick={handleUpload} disabled={loading || !file}>
                    {loading ? "Uploading..." : "Submit Attendance"}
                </Button>

                {msg && <Alert severity={msg.type} sx={{ mt: 2 }}>{msg.text}</Alert>}
            </Paper>
        </Container>
    );
}