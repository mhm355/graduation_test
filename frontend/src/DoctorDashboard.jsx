import { Container, Typography, Box, Paper, Button, Grid, Card, CardContent } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SchoolIcon from '@mui/icons-material/School';
import EventNoteIcon from '@mui/icons-material/EventNote';

export default function DoctorDashboard() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const sections = [
        {
            title: "My Courses",
            desc: "View courses, upload materials, and edit grades.",
            icon: <SchoolIcon fontSize="large" color="primary" />,
            action: () => navigate("/doctor/courses"),
            btnText: "Manage Courses"
        },
        {
            title: "Bulk Upload Grades",
            desc: "Upload Excel sheet for multiple students.",
            icon: <CloudUploadIcon fontSize="large" color="secondary" />,
            action: () => navigate("/upload"),
            btnText: "Upload Excel"
        },
        {
            title: "Bulk Upload Attendance",
            desc: "Upload daily attendance sheet.",
            icon: <EventNoteIcon fontSize="large" color="success" />,
            action: () => navigate("/doctor/attendance"),
            btnText: "Upload Sheet"
        }
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                    Doctor Dashboard
                </Typography>
                <Button variant="outlined" color="error" onClick={handleLogout}>
                    Logout
                </Button>
            </Box>

            {/* Welcome Banner */}
            <Paper sx={{ p: 3, mb: 4, bgcolor: "#fff3e0", borderLeft: "6px solid #ff9800" }}>
                <Typography variant="h6" fontWeight="bold">Academic Staff Portal</Typography>
                <Typography variant="body1">
                    Welcome, Doctor. Select an action below to manage your academic duties.
                </Typography>
            </Paper>

            {/* Action Grid */}
            <Grid container spacing={3}>
                {sections.map((item, index) => (
                    <Grid item xs={12} md={4} key={index}>
                        <Card elevation={3} sx={{ height: "100%", textAlign: "center", py: 2 }}>
                            <CardContent>
                                <Box mb={2}>{item.icon}</Box>
                                <Typography variant="h6" gutterBottom fontWeight="bold">
                                    {item.title}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" mb={3}>
                                    {item.desc}
                                </Typography>
                                <Button variant="outlined" fullWidth onClick={item.action}>
                                    {item.btnText}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}