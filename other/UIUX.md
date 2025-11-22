# UI/UX Specification Document
**Project:** BSU Engineering Portal 

---

## 1. Visual Identity & Design System

###  Color Palette

#### Primary Colors
| Color Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Navy Blue** | `#0A2342` | Primary Brand Color, Headers, Navbars |
| **Blue** | `#1B4B8A` | Secondary Brand Color, Active States, Links |

#### Secondary Colors
| Color Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Golden Yellow** | `#F7B500` | CTAs (Call to Action), Highlights |
| **Orange** | `#F95738` | Accents, "Apply Now" buttons |

#### Neutrals
| Color Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Dark Gray** | `#1F2937` | Primary Text |
| **Medium Gray** | `#6B7280` | Secondary Text, Subtitles |
| **Light Gray** | `#E5E7EB` | Borders, Dividers |
| **Background** | `#F8FAFC` | Page Backgrounds |
| **White** | `#FFFFFF` | Cards, Containers, Modals |

#### Status Indicators
| Status | Hex Code | Usage |
| :--- | :--- | :--- |
| **Success** | `#16A34A` | Grade Passed, Form Submitted |
| **Warning** | `#FACC15` | Deadlines, Missing Info |
| **Danger** | `#DC2626` | Grade Failed, Delete Action, Error |

---

###  Typography
**Theme:** Bilingual Support (RTL/LTR)

#### Font Families
* **Arabic (Primary):** `Cairo`
* **Arabic (Secondary):** `Tajawal`
* **English (Primary):** `Inter`
* **English (Secondary):** `Poppins`

#### Typography Hierarchy
| Element | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **H1** | 40px | 700 (Bold) | 1.2 | Main Page Titles |
| **H2** | 32px | 700 (Bold) | 1.2 | Section Headers |
| **H3** | 26px | 500 (Medium) | 1.2 | Card Titles |
| **Body** | 16-18px | 400 (Regular) | 1.5 | General Content |
| **Small** | 14px | 400 (Regular) | 1.5 | Meta data, Footer text |
| **Button** | 16-18px | 500/700 | - | Clickable elements |

---

## 2. Navigation Structure

**Main Header (Top Bar):**
* Home
* About
* Departments
* Student Affairs
* Student Portal (Login Action)
* Staff
* News
* Contact

---

## 3. User Experience (UX) Flows

###  Flow 1: General Visitor (Public)
**Goal:** Access general information, news, and department details without logging in.

1.  **Homepage**
    * Click: `Latest News` → Redirects to **News Details Page**.
    * Click: `Quick Links` (Study Schedule, Academic Calendar, Exam Schedule).
    * Scroll: View **Departments Preview**.
    * Scroll: View **Events**.
2.  **Navigation Interactions**
    * **About:** View Vision, Mission, History.
    * **Departments:** Dropdown menu (Electrical, Civil, Architecture).
    * **Student Affairs:** View general schedules and calendars.
    * **Staff:** View Academic Staff Directory (Public profiles).
    * **News & Events:** View Competitions, Workshops, Seminars.
    * **Contact:** View Map, Emails, Support Form.

---

###  Flow 2: Student Portal (Secure)
**Goal:** Students log in to manage their academic life (Grades, Attendance, Materials).

1.  **Login Entry**
    * User clicks "Student Portal" or "Login".
    * **Login Page:** Enter ID & Password.
        * *Success:* Redirect to **Dashboard**.
        * *Failure:* Show Error Message ("Invalid Credentials").
2.  **Dashboard Hub**
    * **Registered Courses:** List of active courses.
        * *Drill-down:* Click Course → View Materials (PDFs), Attendance log, Assignments.
    * **Attendance:** View overall attendance table/percentage.
    * **Grades:** View Transcript/Grades Table → Option to **Download PDF**.
    * **Materials:** Central list of downloadable files.
    * **Exam Results:** View Midterm/Final scores.
3.  **Exit**
    * Click **Logout** → Clear Session → Return to Homepage.

---

### Flow 3: Departments Section
**Goal:** Explore academic departments and their offerings.

1.  **Departments Main Page**
    * User selects a department (e.g., **Electrical Engineering**).
2.  **Department Detail Page**
    * **Overview:** Read about the department.
    * **Study Plan:** View or Download PDF/Table of the curriculum.
    * **Staff:** View list of doctors/TAs in this specific department → Click for Profile.
    * **Courses:** Browse list of courses offered.
    * **Labs:** View lab facilities and details.
    * **Graduation Projects:** View archive of previous projects.

---
### Flow 4: News & Events
**Goal:** Stay updated with university happenings.

1.  **News Landing Page**
    * Filter by Category: `General`, `Competitions`, `Workshops`, `Seminars`.
2.  **Interaction**
    * Click specific News Item → **News Detail Page** (Full text + Images).
    * Click specific Event → **Event Detail Page** (Date, Location, Register button).

---

### Flow 5: Contact Support
**Goal:** Reach university administration or technical support.

1.  **Contact Page**
    * **Visual:** View Google Map embedding of campus location.
    * **Action:** Click Email link → Opens default mail client.
    * **Action:** Fill **Support Form** (Name, Email, Message) → Click Submit.
    * **Feedback:** User sees "Success Message" → Redirects to Home.