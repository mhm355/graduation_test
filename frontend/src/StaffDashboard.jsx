import { useState, useEffect } from "react";
import { Container, Typography, Box, Paper, Button, Grid, Card, CardActionArea, CardContent, Breadcrumbs, Link, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DomainIcon from '@mui/icons-material/Domain';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SchoolIcon from '@mui/icons-material/School';
import UploadFileIcon from '@mui/icons-material/UploadFile';

export default function StaffDashboard() {
    const navigate = useNavigate();

    // State for Navigation Stack
    const [step, setStep] = useState(1); // 1=Dept, 2=Year, 3=Level
    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);

    // Data State
    const [departments, setDepartments] = useState([]);
    const [years, setYears] = useState([]);
    const [levels, setLevels] = useState([]);

    // Load Departments on Start
    useEffect(() => {
        fetchData("/api/departments/", setDepartments);
        fetchData("/api/years/", setYears); // Fetch years once
        fetchData("/api/levels/", setLevels); // Fetch levels once
    }, []);

    const fetchData = async (url, setter) => {
        const token = localStorage.getItem("access_token");
        try {
            const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
            setter(res.data);
        } catch (err) { console.error(err); }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    // --- Navigation Handlers ---
    const selectDept = (dept) => { setSelectedDept(dept); setStep(2); };
    const selectYear = (year) => { setSelectedYear(year); setStep(3); };

    // The Final Action: Go to Upload Page with Pre-filled Data
    const goToUpload = (level) => {
        navigate("/staff/students", {
            state: {
                dept: selectedDept.name,
                year: selectedYear.year,
                level: level.name
            }
        });
    };

    const reset = () => { setStep(1); setSelectedDept(null); setSelectedYear(null); };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" color="primary" fontWeight="bold">System Administration</Typography>
                <Button variant="outlined" color="error" onClick={handleLogout}>Logout</Button>
            </Box>

            {/* Breadcrumbs Navigation */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: "#f5f5f5" }}>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link component="button" underline="hover" color="inherit" onClick={reset}>
                        All Departments
                    </Link>
                    {selectedDept && (
                        <Link component="button" underline="hover" color="inherit" onClick={() => setStep(2)}>
                            {selectedDept.name}
                        </Link>
                    )}
                    {selectedYear && (
                        <Typography color="text.primary">{selectedYear.year}</Typography>
                    )}
                </Breadcrumbs>
            </Paper>

            {/* --- STEP 1: SELECT DEPARTMENT --- */}
            {step === 1 && (
                <Box>
                    <Typography variant="h5" gutterBottom fontWeight="bold">Select Department</Typography>
                    <Grid container spacing={3}>
                        {departments.map((dept) => (
                            <Grid item xs={12} md={4} key={dept.id}>
                                <Card elevation={3}>
                                    <CardActionArea onClick={() => selectDept(dept)} sx={{ py: 4, textAlign: 'center' }}>
                                        <DomainIcon fontSize="large" color="primary" />
                                        <Typography variant="h6" sx={{ mt: 1 }}>{dept.name}</Typography>
                                        <Typography variant="caption" color="textSecondary">{dept.code}</Typography>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* --- STEP 2: SELECT ACADEMIC YEAR --- */}
            {step === 2 && (
                <Box>
                    <Typography variant="h5" gutterBottom fontWeight="bold">Select Academic Year for {selectedDept.name}</Typography>
                    <Grid container spacing={3}>
                        {years.map((year) => (
                            <Grid item xs={12} md={3} key={year.id}>
                                <Card elevation={3}>
                                    <CardActionArea onClick={() => selectYear(year)} sx={{ py: 4, textAlign: 'center' }}>
                                        <CalendarTodayIcon fontSize="large" color="secondary" />
                                        <Typography variant="h6" sx={{ mt: 1 }}>{year.year}</Typography>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* --- STEP 3: SELECT LEVEL & UPLOAD --- */}
            {step === 3 && (
                <Box>
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                        {selectedDept.name} - {selectedYear.year} Levels
                    </Typography>
                    <Typography variant="body1" color="textSecondary" mb={3}>
                        Select a level to upload the student list.
                    </Typography>

                    <Grid container spacing={3}>
                        {levels.map((level) => (
                            <Grid item xs={12} md={3} key={level.id}>
                                <Card elevation={3}>
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <SchoolIcon fontSize="large" color="action" sx={{ mb: 1 }} />
                                        <Typography variant="h6" gutterBottom>{level.name}</Typography>
                                        <Divider sx={{ my: 1 }} />
                                        <Button
                                            variant="contained"
                                            startIcon={<UploadFileIcon />}
                                            fullWidth
                                            size="small"
                                            onClick={() => goToUpload(level)}
                                        >
                                            Upload Students
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Container>
    );
}