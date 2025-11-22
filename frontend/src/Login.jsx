import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Paper, TextField, Button, Typography, Box, Alert } from "@mui/material";

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            // 1. Send the request to Django
            const response = await axios.post("http://localhost:8000/api/token/", {
                username: username,
                password: password,
            });

            // 2. If success, save the "ID Card" (Token) in the browser
            localStorage.setItem("access_token", response.data.access);
            localStorage.setItem("refresh_token", response.data.refresh);

            navigate("/dashboard");

        } catch (err) {
            console.error("Login Failed:", err);
            setError("Invalid ID or Password");
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Paper elevation={3} sx={{ p: 4, width: "100%", textAlign: "center" }}>

                    {/* BSU Logo Placeholder */}
                    <Typography variant="h5" component="h1" gutterBottom color="primary" fontWeight="bold">
                        BSU Engineering Portal
                    </Typography>

                    <Typography variant="body2" color="textSecondary" mb={3}>
                        Sign in to your academic account
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <form onSubmit={handleLogin}>
                        <TextField
                            label="Username / National ID"
                            fullWidth
                            margin="normal"
                            variant="outlined"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            margin="normal"
                            variant="outlined"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: "bold" }}
                        >
                            Sign In
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
}