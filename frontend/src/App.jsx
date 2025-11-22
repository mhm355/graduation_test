import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import Login from "./Login";
import Dashboard from "./Dashboard";

// Define the BSU Theme
const theme = createTheme({
  palette: {
    primary: { main: "#0A2342" }, // Navy Blue
    secondary: { main: "#F7B500" }, // Gold
    background: { default: "#F8FAFC" }
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* The Public Login Page */}
          <Route path="/" element={<Login />} />
          
          {/* The Private Dashboard Page */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;