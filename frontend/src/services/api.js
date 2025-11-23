import axios from "axios";

//const API_URL = "http://localhost:8000/api";

const API_URL = "/api";
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

// 3. Fetch Public News
export const fetchNews = async () => {
  const response = await axios.get(`${API_URL}/news/`);
  return response.data;
};

// Fetch ALL grades (Doctor View)
export const fetchAllGrades = async () => {
  const response = await axios.get(`${API_URL}/doctor/grades/`, getAuthHeader());
  return response.data;
};

// Update ONE grade
export const updateGrade = async (id, newScore) => {
  const response = await axios.put(`${API_URL}/doctor/grades/${id}/update/`, { score: newScore }, getAuthHeader());
  return response.data;
};

// Fetch Materials for a specific Course
export const fetchCourseMaterials = async (courseId) => {
  const response = await axios.get(`${API_URL}/courses/${courseId}/materials/`, getAuthHeader());
  return response.data;
};