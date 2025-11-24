import { useState, useEffect } from "react";
import { Container, Typography, Box, Paper, Button, Grid, Card, CardActionArea, CardContent, Breadcrumbs, Link, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DomainIcon from '@mui/icons-material/Domain';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SchoolIcon from '@mui/icons-material/School';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete'; // <--- Import Delete Icon

export default function StaffDashboard() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);

    const [departments, setDepartments] = useState([]);
    const [years, setYears] = useState([]);
    const [levels, setLevels] = useState([]);

    const [openDialog, setOpenDialog] = useState(false);
    const [newItemName, setNewItemName] = useState("");
    const [dialogType, setDialogType] = useState("");

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

    // --- DELETE LOGIC ---
    const handleDelete = async (e, type, id) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure? This will send a deletion request to the Admin.")) return;

        const token = localStorage.getItem("access_token");
        const url = type === "YEAR" ? `/api/years/${id}/` : `/api/levels/${id}/`;

        try {
            const res = await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });

            // Check the status code
            if (res.status === 202) {
                // It was a REQUEST, not a delete
                alert("Request Sent! An Admin must approve this deletion.");
                // DO NOT remove it from the UI yet
            } else {
                // It was an instant delete (if you were Admin)
                if (type === "YEAR") setYears(years.filter(y => y.id !== id));
                if (type === "LEVEL") setLevels(levels.filter(l => l.id !== id));
            }
        } catch (err) {
            alert("Failed to send request.");
        }
    };

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
                const res = await axios.post("/api/years/", { year: newItemName }, { headers });
                setYears([...years, res.data]);
            } else if (dialogType === "LEVEL") {
                const res = await axios.post("/api/levels/", { name: newItemName }, { headers });
                setLevels([...levels, res.data]);
            }
            setOpenDialog(false);
        } catch (err) {
            alert("Failed to create item.");
        }
    };

    const selectDept = (dept) => { setSelectedDept(dept); setStep(2); };
    const selectYear = (year) => { setSelectedYear(year); setStep(3); };

    const goToUpload = (level) => {
        navigate("/staff/students", { state: { dept: selectedDept.name, year: selectedYear.year, level: level.name } });
    };

    const goToViewList = (level) => {
        navigate("/staff/students/list", { state: { dept: selectedDept.name, year: selectedYear.year, level: level.name } });
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
                    {selectedDept && <Link component="button" underline="hover" color="inherit" onClick={() => setStep(2)}>{selectedDept.name}</Link>}
                    {selectedYear && <Typography color="text.primary">{selectedYear.year}</Typography>}
                </Breadcrumbs>
            </Paper>

            {/* --- STEP 1: MAIN DASHBOARD --- */}
            {step === 1 && (
                <Box>

                    {/* --- NEW: QUICK ACTIONS SECTION --- */}
                    <Typography variant="h5" gutterBottom fontWeight="bold">Quick Actions</Typography>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={4}>
                            <Card elevation={3} sx={{ borderLeft: "6px solid #ed6c02" }}> {/* Orange accent */}
                                <CardActionArea
                                    onClick={() => navigate("/staff/certificate")}
                                    sx={{ py: 3, textAlign: 'center' }}
                                >
                                    <SchoolIcon fontSize="large" color="warning" />
                                    <Typography variant="h6" sx={{ mt: 1 }}>Upload Grad Certs</Typography>
                                    <Typography variant="caption" color="textSecondary">For 4th Year Students</Typography>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    </Grid>
                    {/* ---------------------------------- */}

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

            {/* --- STEP 2: YEAR + DELETE BUTTON --- */}
            {step === 2 && (
                <Box>
                    <Typography variant="h5" gutterBottom fontWeight="bold">Academic Years</Typography>
                    <Grid container spacing={3}>
                        {years.map((year) => (
                            <Grid item xs={12} md={3} key={year.id}>
                                <Card elevation={3} sx={{ position: "relative" }}>
                                    {/* Delete Button */}
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={(e) => handleDelete(e, "YEAR", year.id)}
                                        sx={{ position: "absolute", top: 5, right: 5, zIndex: 10 }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>

                                    <CardActionArea onClick={() => selectYear(year)} sx={{ py: 4, textAlign: 'center' }}>
                                        <CalendarTodayIcon fontSize="large" color="secondary" />
                                        <Typography variant="h6" sx={{ mt: 1 }}>{year.year}</Typography>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}

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

            {/* --- STEP 3: LEVEL + DELETE BUTTON --- */}
            {step === 3 && (
                <Box>
                    <Typography variant="h5" gutterBottom fontWeight="bold">{selectedYear.year} Levels</Typography>
                    <Grid container spacing={3}>
                        {levels.map((level) => (
                            <Grid item xs={12} md={3} key={level.id}>
                                <Card elevation={3} sx={{ position: "relative" }}>
                                    {/* Delete Button */}
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={(e) => handleDelete(e, "LEVEL", level.id)}
                                        sx={{ position: "absolute", top: 5, right: 5, zIndex: 10 }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>

                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <SchoolIcon fontSize="large" color="action" sx={{ mb: 1 }} />
                                        <Typography variant="h6" gutterBottom>{level.name}</Typography>
                                        <Divider sx={{ my: 1 }} />
                                        <Box display="flex" gap={1} mt={2}>
                                            <Button variant="contained" startIcon={<UploadFileIcon />} fullWidth size="small" onClick={() => goToUpload(level)}>Upload</Button>
                                            <Button variant="outlined" startIcon={<VisibilityIcon />} fullWidth size="small" onClick={() => goToViewList(level)}>View</Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}

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