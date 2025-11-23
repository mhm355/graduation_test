import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, Box, Paper, Button, List, ListItem, ListItemText, ListItemAvatar, Avatar, IconButton, Alert, CircularProgress } from "@mui/material";
import DescriptionIcon from '@mui/icons-material/Description'; // PDF Icon
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { fetchCourseMaterials } from "./services/api";

export default function CourseMaterials() {
    const { id } = useParams(); // Get "5" from url /course/5/materials
    const navigate = useNavigate();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadMaterials = async () => {
            try {
                const data = await fetchCourseMaterials(id);
                setMaterials(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load materials.");
            } finally {
                setLoading(false);
            }
        };
        loadMaterials();
    }, [id]);

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            {/* Header with Back Button */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/dashboard")}
                sx={{ mb: 2 }}
            >
                Back to Dashboard
            </Button>

            <Box mb={4}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                    Course Materials
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    Download lectures, assignments, and notes.
                </Typography>
            </Box>

            {/* Loading State */}
            {loading && <Box textAlign="center"><CircularProgress /></Box>}

            {/* Error State */}
            {error && <Alert severity="error">{error}</Alert>}

            {/* Materials List */}
            {!loading && !error && (
                <Paper elevation={3}>
                    <List>
                        {materials.map((file) => (
                            <ListItem
                                key={file.id}
                                secondaryAction={
                                    <IconButton
                                        edge="end"
                                        color="primary"
                                        // This opens the file URL in a new tab to trigger download
                                        href={file.file}
                                        target="_blank"
                                    >
                                        <DownloadIcon />
                                    </IconButton>
                                }
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: "#e3f2fd", color: "#0A2342" }}>
                                        <DescriptionIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={<Typography fontWeight="bold">{file.title}</Typography>}
                                    secondary={`Uploaded: ${new Date(file.uploaded_at).toLocaleDateString()}`}
                                />
                            </ListItem>
                        ))}

                        {materials.length === 0 && (
                            <Box p={4} textAlign="center">
                                <Typography color="textSecondary">No materials uploaded for this course yet.</Typography>
                            </Box>
                        )}
                    </List>
                </Paper>
            )}
        </Container>
    );
}