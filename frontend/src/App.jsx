import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Grades from "./Grades";
import UploadGrades from "./UploadGrades";
import Home from "./Home";
import DoctorDashboard from "./DoctorDashboard";
import DoctorGrades from "./DoctorGrades";
import UploadAttendance from "./UploadAttendance";
import StudentAttendance from "./StudentAttendance";
import CourseMaterials from "./CourseMaterials";
import DoctorCourses from "./DoctorCourses";
import StaffDashboard from "./StaffDashboard";
import StudentRegistration from "./StudentRegistration";
import StudentList from "./StudentList";
import DoctorCourseManage from "./DoctorCourseManage";
// Define the BSU Theme
const theme = createTheme({
  palette: {
    primary: { main: "#0A2342" }, // Navy Blue
    secondary: { main: "#F7B500" }, // Gold
    background: { default: "#F8FAFC" }
  },

  typography: {
    fontFamily: "Inter, Cairo, sans-serif", // <--- Set the global font
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* NEW: The Public Home Page is now the default */}
          <Route path="/" element={<Home />} />

          {/* CHANGED: Login moved to /login */}
          <Route path="/login" element={<Login />} />

          {/* Existing Private Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/grades" element={<Grades />} />
          <Route path="/upload" element={<UploadGrades />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/grades" element={<DoctorGrades />} />
          <Route path="/doctor/attendance" element={<UploadAttendance />} />
          <Route path="/student/attendance" element={<StudentAttendance />} />
          <Route path="/course/:id/materials" element={<CourseMaterials />} />
          <Route path="/doctor/courses" element={<DoctorCourses />} />
          <Route path="/staff-dashboard" element={<StaffDashboard />} />
          <Route path="/staff/students" element={<StudentRegistration />} />
          <Route path="/staff/students/list" element={<StudentList />} />
          <Route path="/doctor/course/:id/manage" element={<DoctorCourseManage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;