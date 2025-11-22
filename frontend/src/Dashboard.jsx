import { useEffect, useState } from "react";
import { Container, Typography, Box, Paper, Button, Grid, Card, CardContent, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchCourses } from "./services/api"; 

export default function Dashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]); // Store the list from DB

  // Load data when page opens
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await fetchCourses();
      setCourses(data); // Save the real data to state
    } catch (error) {
      console.error("Failed to load courses", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" color="primary" fontWeight="bold">
          Student Dashboard
        </Typography>
        <Button variant="outlined" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Welcome Card */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: "#e3f2fd" }}>
            <Typography variant="h6">Welcome back!</Typography>
            <Typography variant="body1">
              You are connected to the live system.
            </Typography>
          </Paper>
        </Grid>

        {/* --- DYNAMIC COURSE LIST (FROM DATABASE) --- */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Available Courses (Live Data)
          </Typography>
          
          <Grid container spacing={2}>
            {courses.map((course) => (
              <Grid item xs={12} md={4} key={course.id}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="overline" color="textSecondary">
                      {course.code}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {course.name}
                    </Typography>
                            <Box mt={2} display="flex" justifyContent="space-between" flexWrap="wrap" gap={1}>
                                <Chip label={course.department_name} color="primary" size="small" variant="outlined" sx={{ borderRadius: "4px", fontWeight: "bold", height: "24px", }} />
                                <Typography variant="caption" fontWeight="bold" color="textSecondary">
                        {course.credit_hours} Credits
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {courses.length === 0 && (
              <Typography sx={{ p: 2, color: 'gray' }}>No courses found in database.</Typography>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}