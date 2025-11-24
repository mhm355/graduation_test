import { useEffect, useState } from "react";
import { Container, Typography, Box, Paper, Button, Grid, Card, CardContent, Chip, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchCourses } from "./services/api";
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';

export default function Dashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await fetchCourses();
      setCourses(data);
    } catch (error) {
      console.error("Failed to load courses", error);
      setError("Failed to load courses. Please try logging in again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/"); // Navigate to public homepage
  };

  const handleDownloadCert = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get("/api/my-certificate/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // The API returns the file URL; we just open it to trigger download
      window.open(response.data.file, '_blank');

    } catch (err) {
      // If 404 (Not Found) or 403 (Not Eligible/Not 4th Year)
      const errorMsg = err.response?.data?.error || "Certificate not found or you are not yet eligible.";
      alert(`Download Failed: ${errorMsg}`);
    }
  };

  // State to hold the user's role (optional, for display purposes)
  const userRole = localStorage.getItem("user_role") || "STUDENT";

  if (loading) return <Typography p={4}>Loading Dashboard...</Typography>;
  if (error) return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;


  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" color="primary" fontWeight="bold">
          Student Dashboard
        </Typography>
        <Button variant="outlined" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Quick Actions (View Grades, View Attendance, Download Certificate) */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: "100%", bgcolor: "#e3f2fd", borderLeft: "6px solid #1B4B8A" }}>
            <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">Quick Actions</Typography>
            <Button
              variant="contained"
              startIcon={<AssessmentIcon />}
              fullWidth
              sx={{ mb: 1, fontWeight: 'bold' }}
              onClick={() => navigate("/grades")}
            >
              View My Grades
            </Button>
            <Button
              variant="contained"
              startIcon={<PeopleIcon />}
              fullWidth
              sx={{ mb: 1, fontWeight: 'bold' }}
              onClick={() => navigate("/student/attendance")}
            >
              View Attendance
            </Button>
            <Button
              variant="contained"
              color="warning"
              startIcon={<DownloadIcon />}
              fullWidth
              onClick={handleDownloadCert}
              sx={{ fontWeight: 'bold' }}
            >
              Graduation Certificate
            </Button>
          </Paper>
        </Grid>

        {/* Welcome Card & Course List */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">Welcome, {localStorage.getItem("username") || "Student"}!</Typography>
            <Typography variant="body1">
              You are connected to the live system. Role: {userRole}.
            </Typography>
          </Paper>

          <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 2 }}>
            Registered Courses
          </Typography>

          <Grid container spacing={2}>
            {courses.map((course) => (
              <Grid item xs={12} md={6} key={course.id}>
                <Card elevation={3} sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="overline" color="textSecondary">
                      {course.code}
                    </Typography>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      {course.name}
                    </Typography>

                    <Box mt={2} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                      <Chip label={course.department_name} color="primary" size="small" variant="outlined" sx={{ borderRadius: "4px" }} />
                      <Typography variant="caption" fontWeight="bold" color="textSecondary">
                        {course.credit_hours} Credits
                      </Typography>
                    </Box>

                    <Button
                      size="small"
                      variant="outlined"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => navigate(`/course/${course.id}/materials`)}
                    >
                      View Materials
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}