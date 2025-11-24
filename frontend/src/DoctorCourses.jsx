import { useEffect, useState } from "react";
import { Container, Typography, Button, Grid, Card, CardContent, Box, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SettingsIcon from '@mui/icons-material/Settings';

export default function DoctorCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await axios.get("/api/doctor/courses/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(res.data);
    } catch (err) { console.error(err); }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Button onClick={() => navigate("/doctor-dashboard")} sx={{ mb: 2 }}>← Back to Dashboard</Button>
      <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>My Assigned Courses</Typography>

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} md={6} key={course.id}>
            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Course Code (e.g. EE101) */}
                <Typography variant="overline" color="textSecondary">{course.code}</Typography>

                {/* Course Name (e.g. Circuit Analysis) */}
                <Typography variant="h5" fontWeight="bold" gutterBottom>{course.name}</Typography>

                {/* Tags Section */}
                <Box mb={3} display="flex" gap={1} flexWrap="wrap">
                  {/* 1. Department Name */}
                  <Chip
                    label={course.department_name}
                    color="primary"
                    size="small"
                    variant="outlined"
                  />

                  {/* 2. Level Name (e.g. First Year) */}
                  <Chip
                    label={course.level_name || "N/A"}
                    color="primary"
                    size="small"
                  />
                </Box>

                {/* Action Button */}
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    startIcon={<SettingsIcon />}
                    fullWidth
                    size="large"
                    onClick={() => navigate(`/doctor/course/${course.id}/manage`)}
                  >
                    Manage Course
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {courses.length === 0 && (
          <Typography sx={{ p: 3 }}>You have not been assigned any courses yet.</Typography>
        )}
      </Grid>
    </Container>
  );
}