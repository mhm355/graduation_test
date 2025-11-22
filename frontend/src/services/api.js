import axios from "axios";

const API_URL = "http://localhost:8000/api";

// Helper to get the token from storage
const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

// 1. Fetch All Courses (Public)
export const fetchCourses = async () => {
  const response = await axios.get(`${API_URL}/courses/`);
  return response.data;
};

// 2. Fetch My Grades (Private)
export const fetchMyGrades = async () => {
  const response = await axios.get(`${API_URL}/my-grades/`, getAuthHeader());
  return response.data;
};