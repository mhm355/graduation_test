import { Container, Typography, Box, Paper, Button, Grid, Card, CardContent, CardActionArea } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SchoolIcon from '@mui/icons-material/School';
import EventNoteIcon from '@mui/icons-material/EventNote'; // For Exam Schedule later

export default function DoctorDashboard() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const sections = [
        {
            title: "My Courses",
            desc: "Manage grades, attendance, and course materials.",
            icon: <SchoolIcon fontSize="large" color="primary" />,
            action: () => navigate("/doctor/courses"),
            btnText: "View Assigned Courses"
        },
        // Placeholder for the next feature (Exams) so the page isn't too empty
        {
            title: "Exam Schedule",
            desc: "Schedule Midterms and Finals.",
            icon: <EventNoteIcon fontSize="large" color="secondary" />,
            action: () => navigate("/doctor/exams"), // <--- LINK IT HERE
            btnText: "Manage Exams"
        },
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
                    Welcome, Doctor. Access your courses below to manage students and results.
                </Typography>
            </Paper>

            {/* Action Grid */}
            <Grid container spacing={3}>
                {sections.map((item, index) => (
                    <Grid item xs={12} md={6} key={index}>
                        <Card elevation={3} sx={{ height: "100%" }}>
                            <CardActionArea onClick={item.action} sx={{ height: "100%", p: 2, textAlign: "center" }}>
                                <Box mb={2}>{item.icon}</Box>
                                <Typography variant="h5" gutterBottom fontWeight="bold">
                                    {item.title}
                                </Typography>
                                <Typography variant="body1" color="textSecondary">
                                    {item.desc}
                                </Typography>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}