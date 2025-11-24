import { useEffect, useState } from "react";
import { Container, Typography, Box, Paper, Button, Grid, Card, CardContent, Chip, Alert, LinearProgress, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DownloadIcon from '@mui/icons-material/Download';
import MenuBookIcon from '@mui/icons-material/MenuBook';

export default function Dashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };
      try {
        // 1. Fetch Profile (to check Level)
        const profRes = await axios.get("/api/profile/", { headers });
        setProfile(profRes.data);

        // 2. Fetch Courses (Now includes Grade/Attendance)
        const courseRes = await axios.get("/api/courses/", { headers });
        setCourses(courseRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleDownloadCert = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await axios.get("/api/my-certificate/", { headers: { Authorization: `Bearer ${token}` } });
      window.open(res.data.file, '_blank');
    } catch (err) {
      alert("Certificate not found.");
    }
  };

  if (loading) return <Typography p={4}>Loading...</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
            <Typography variant="h4" color="primary" fontWeight="bold">Student Dashboard</Typography>
            <Typography variant="subtitle1" color="textSecondary">
                {profile?.username} &mdash; {profile?.level}
            </Typography>
        </Box>
        <Button variant="outlined" color="error" onClick={handleLogout}>Logout</Button>
      </Box>

      <Grid container spacing={3}>
        
        {/* SIDEBAR (Only shows Certificate for 4th Year) */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, bgcolor: "#f5f5f5", height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">Quick Actions</Typography>
            
            {profile?.level === "Fourth Year" ? (
                <Button 
                  variant="contained" 
                  color="warning" 
                  startIcon={<DownloadIcon />} 
                  fullWidth 
                  onClick={handleDownloadCert}
                >
                  Get Certificate
                </Button>
            ) : (
                <Typography variant="body2" color="textSecondary">
                    No actions available for your level.
                </Typography>
            )}
          </Paper>
        </Grid>

        {/* COURSE LIST */}
        <Grid item xs={12} md={9}>
            <Typography variant="h5" gutterBottom fontWeight="bold">My Courses</Typography>
            
            {courses.map((course) => (
                <Card key={course.id} elevation={3} sx={{ mb: 2 }}>
                    <CardContent>
                        {/* Course Header */}
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="h6" fontWeight="bold">{course.name}</Typography>
                            <Chip label={course.code} size="small" variant="outlined" />
                        </Box>
                        <Divider sx={{ mb: 2 }} />

                        <Grid container spacing={2} alignItems="center">
                            
                            {/* 1. GRADE SECTION */}
                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" color="textSecondary">GRADE</Typography>
                                {course.student_grade ? (
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Typography variant="h5" fontWeight="bold" color="primary">
                                            {course.student_grade.score}
                                        </Typography>
                                        <Chip label={course.student_grade.letter} color={course.student_grade.letter === 'F' ? 'error' : 'success'} size="small" />
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="textSecondary">- Not Graded -</Typography>
                                )}
                            </Grid>

                            {/* 2. ATTENDANCE SECTION */}
                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" color="textSecondary">ATTENDANCE</Typography>
                                {course.student_attendance ? (
                                    <Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" fontWeight="bold">{course.student_attendance.percentage}%</Typography>
                                            <Typography variant="caption">{course.student_attendance.attended}/{course.student_attendance.total}</Typography>
                                        </Box>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={course.student_attendance.percentage} 
                                            sx={{ height: 6, borderRadius: 3, mt: 0.5 }} 
                                            color={course.student_attendance.percentage < 75 ? "error" : "success"}
                                        />
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="textSecondary">- No Record -</Typography>
                                )}
                            </Grid>

                            {/* 3. MATERIAL BUTTON */}
                            <Grid item xs={12} sm={4} textAlign="right">
                                <Button 
                                    variant="outlined" 
                                    startIcon={<MenuBookIcon />}
                                    onClick={() => navigate(`/course/${course.id}/materials`)}
                                >
                                    Materials
                                </Button>
                            </Grid>

                        </Grid>
                    </CardContent>
                </Card>
            ))}
        </Grid>

      </Grid>
    </Container>
  );
}