import { Container, Typography, Box, Paper, Button, Grid, Card } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DomainIcon from '@mui/icons-material/Domain'; // Department Icon
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'; // Year Icon
import LayersIcon from '@mui/icons-material/Layers'; // Level Icon
import GroupAddIcon from '@mui/icons-material/GroupAdd'; // Student Icon

export default function StaffDashboard() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const sections = [
        { title: "Departments", icon: <DomainIcon fontSize="large" color="primary" />, action: () => alert("Manage Depts") },
        { title: "Academic Years", icon: <CalendarTodayIcon fontSize="large" color="secondary" />, action: () => alert("Manage Years") },
        { title: "Levels", icon: <LayersIcon fontSize="large" color="action" />, action: () => alert("Manage Levels") },
        { title: "Register Students", icon: <GroupAddIcon fontSize="large" color="success" />, action: () => navigate("/staff/students") }, // We will build this next
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                    Student Affairs
                </Typography>
                <Button variant="outlined" color="error" onClick={handleLogout}>
                    Logout
                </Button>
            </Box>

            {/* Welcome Banner */}
            <Paper sx={{ p: 3, mb: 4, bgcolor: "#e8f5e9", borderLeft: "6px solid #2e7d32" }}>
                <Typography variant="h6" fontWeight="bold">System Administration</Typography>
                <Typography variant="body1">
                    Manage university structure and student enrollment data.
                </Typography>
            </Paper>

            <Grid container spacing={3}>
                {sections.map((item, index) => (
                    <Grid item xs={12} md={3} key={index}>
                        <Card elevation={3} sx={{ height: "100%", textAlign: "center", py: 3, cursor: 'pointer' }} onClick={item.action}>
                            <Box mb={2}>{item.icon}</Box>
                            <Typography variant="h6">{item.title}</Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}