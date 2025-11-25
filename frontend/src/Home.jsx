import { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button, Container, Grid, Card, CardContent, Box, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchNews } from "./services/api";

export default function Home() {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState([]);

  // Fetch News when page loads
  useEffect(() => {
    const loadNews = async () => {
      try {
        const data = await fetchNews();
        setNewsList(data);
      } catch (error) {
        console.error("Failed to load news", error);
      }
    };
    loadNews();
  }, []);

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      
      {/* 1. NAVBAR */}
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar sx={{ flexWrap: "wrap" }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: "bold", fontFamily: "Inter" }}>
            BSU Engineering Portal
          </Typography>
          
          {/* Navigation Links (Hidden on small screens) */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            {['Home', 'About', 'Departments', 'Student Affairs', 'Staff', 'News', 'Contact'].map((item) => (
              <Button key={item} color="inherit" sx={{ mx: 1, fontSize: "14px" }}>
                {item}
              </Button>
            ))}
          </Box>

          {/* ADMIN BUTTON (Direct link to Django Admin) */}
          <Button 
            color="secondary" 
            href="/admin" 
            sx={{ mr: 1, ml: 2, fontWeight: "bold", color: "#F7B500" }}
          >
            Admin Login
          </Button>

          {/* MAIN LOGIN BUTTON */}
          <Button 
            color="secondary" 
            sx={{ mr: 1, ml: 2, fontWeight: "bold", color: "#F7B500" }}
            onClick={() => navigate("/login")}
          >
            Student/Staff Login
          </Button>
        </Toolbar>
      </AppBar>

      {/* 2. HERO SECTION (Welcome Banner) */}
      {/* Updated: Removed the big 'Access Student Portal' button */}
      <Box sx={{ bgcolor: "#0A2342", color: "white", py: 8, textAlign: "center" }}>
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome to the Faculty of Engineering
          </Typography>
          
          <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
            Beni-Suef University's central hub for students, staff, and academic news.
          </Typography>
        </Container>
      </Box>

      {/* 3. LATEST NEWS SECTION */}
      <Container maxWidth={false} sx={{ mt: 4, mb: 8, px: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
          Latest Announcements
        </Typography>
        
        <Grid container spacing={3}>
          {newsList.map((news) => (
            <Grid item xs={12} md={4} key={news.id}>
              <Card elevation={3} sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(news.created_at).toLocaleDateString()}
                  </Typography>
                  <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                    {news.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {news.content.substring(0, 100)}...
                  </Typography>
                  <Button size="small" sx={{ mt: 2 }}>Read More</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {newsList.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: "center" }}>No announcements available.</Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
}