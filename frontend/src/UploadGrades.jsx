import { useState } from "react";
import axios from "axios";
import { Container, Typography, Button, Box, Paper, Alert, LinearProgress } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function UploadGrades() {
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
            await axios.post("http://localhost/api/upload-grades/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            setStatus({ type: "success", message: "Grades uploaded successfully!" });
        } catch (error) {
            console.error(error);
            setStatus({ type: "error", message: "Upload failed. Check your file format." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
                    Upload Grades
                </Typography>

                <Typography variant="body2" color="textSecondary" mb={3}>
                    Upload the Excel sheet (.xlsx) containing student grades.
                </Typography>

                <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2, width: "100%", height: "50px" }}
                >
                    {file ? file.name : "Select Excel File"}
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