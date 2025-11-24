import { useState, useEffect } from "react";
import { Container, Typography, Box, Paper, Button, Grid, Card, CardActionArea, CardContent, Breadcrumbs, Link, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DomainIcon from '@mui/icons-material/Domain';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SchoolIcon from '@mui/icons-material/School';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function StaffDashboard() {
    const navigate = useNavigate();

    // Navigation State
    const [step, setStep] = useState(1);
    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);

    // Data State
    const [departments, setDepartments] = useState([]);
    const [years, setYears] = useState([]);
    const [levels, setLevels] = useState([]);

    // Dialog State (For Creating New Items)
    const [openDialog, setOpenDialog] = useState(false);
    const [newItemName, setNewItemName] = useState("");
    const [dialogType, setDialogType] = useState(""); // "YEAR" or "LEVEL"

    useEffect(() => {
        fetchData("/api/departments/", setDepartments);
        fetchData("/api/years/", setYears);
        fetchData("/api/levels/", setLevels);
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

    // --- CREATE NEW ITEM LOGIC ---
    const handleOpenAdd = (type) => {
        setDialogType(type);
        setNewItemName("");
        setOpenDialog(true);
    };

    const handleCreateItem = async () => {
        const token = localStorage.getItem("access_token");
        const headers = { Authorization: `Bearer ${token}` };

        try {
            if (dialogType === "YEAR") {
                // Create Year
                const res = await axios.post("/api/years/", { year: newItemName }, { headers });
                setYears([...years, res.data]);
            } else if (dialogType === "LEVEL") {
                // Create Level
                const res = await axios.post("/api/levels/", { name: newItemName }, { headers });
                setLevels([...levels, res.data]);
            }
            setOpenDialog(false);
        } catch (err) {
            alert("Failed to create item. It might already exist.");
        }
    };

    // --- Navigation Handlers ---
    const selectDept = (dept) => { setSelectedDept(dept); setStep(2); };
    const selectYear = (year) => { setSelectedYear(year); setStep(3); };

    const goToUpload = (level) => {
        navigate("/staff/students", {
            state: {
                dept: selectedDept.name,
                year: selectedYear.year,
                level: level.name
            }
        });
    };

    const goToViewList = (level) => {
        navigate("/staff/students/list", {
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" color="primary" fontWeight="bold">System Administration</Typography>
                <Button variant="outlined" color="error" onClick={handleLogout}>Logout</Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3, bgcolor: "#f5f5f5" }}>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link component="button" underline="hover" color="inherit" onClick={reset}>All Departments</Link>
                    {selectedDept && (
                        <Link component="button" underline="hover" color="inherit" onClick={() => setStep(2)}>{selectedDept.name}</Link>
                    )}
                    {selectedYear && <Typography color="text.primary">{selectedYear.year}</Typography>}
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

            {/* --- STEP 2: SELECT OR ADD YEAR --- */}
            {step === 2 && (
                <Box>
                    <Typography variant="h5" gutterBottom fontWeight="bold">Academic Years</Typography>
                    <Grid container spacing={3}>
                        {/* List Existing Years */}
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

                        {/* Add New Year Button */}
                        <Grid item xs={12} md={3}>
                            <Card elevation={0} sx={{ border: '2px dashed #ccc', height: '100%' }}>
                                <CardActionArea onClick={() => handleOpenAdd("YEAR")} sx={{ py: 4, textAlign: 'center', height: '100%' }}>
                                    <AddCircleOutlineIcon fontSize="large" color="action" />
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>Add Year</Typography>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* --- STEP 3: SELECT OR ADD LEVEL --- */}
            {step === 3 && (
                <Box>
                    <Typography variant="h5" gutterBottom fontWeight="bold">{selectedYear.year} Levels</Typography>
                    <Grid container spacing={3}>
                        {/* List Existing Levels */}
                        {levels.map((level) => (
                            <Grid item xs={12} md={3} key={level.id}>
                                <Card elevation={3}>
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <SchoolIcon fontSize="large" color="action" sx={{ mb: 1 }} />
                                        <Typography variant="h6" gutterBottom>{level.name}</Typography>
                                        <Divider sx={{ my: 1 }} />

                                        <Box display="flex" gap={1} mt={2}>
                                            <Button
                                                variant="contained"
                                                startIcon={<UploadFileIcon />}
                                                fullWidth
                                                size="small"
                                                onClick={() => goToUpload(level)}
                                            >
                                                Upload
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                startIcon={<VisibilityIcon />}
                                                fullWidth
                                                size="small"
                                                onClick={() => goToViewList(level)}
                                            >
                                                View
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}

                        {/* Add New Level Button */}
                        <Grid item xs={12} md={3}>
                            <Card elevation={0} sx={{ border: '2px dashed #ccc', height: '100%' }}>
                                <CardActionArea onClick={() => handleOpenAdd("LEVEL")} sx={{ py: 4, textAlign: 'center', height: '100%' }}>
                                    <AddCircleOutlineIcon fontSize="large" color="action" />
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>Add Level</Typography>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* --- CREATE DIALOG --- */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Add New {dialogType === "YEAR" ? "Academic Year" : "Level"}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus margin="dense" fullWidth variant="outlined"
                        label={dialogType === "YEAR" ? "Year (e.g. 2024-2025)" : "Level Name (e.g. First Year)"}
                        value={newItemName} onChange={(e) => setNewItemName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreateItem} variant="contained">Add</Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
}