# 🛠 Technical Specifications & Architecture
**Project:** BSU Engineering Portal  
**Role:** DevOps & Full-Stack Implementation  
**Architecture Type:** Decoupled Containerized Microservices

---

## 1. High-Level Architecture
The system follows a **Decoupled Architecture** pattern, separating the User Interface (Frontend) from the Business Logic (Backend). This ensures scalability, maintainability, and allows for independent deployment pipelines
**The Traffic Flow:**
`User` ➔ `Nginx Gateway (Port 80)` ➔ `Routing` ➔ `React (UI)` OR `Django (API)`

---

## 2. Component Stack

### 🎨 Frontend (User Interface)
Responsible for the visual experience, student dashboard, and interactivity.
* **Framework:** **React.js** (v18+)
* **Build Tool:** **Vite** (For ultra-fast hot-reloading and optimized builds)
* **UI Library:** **Material UI (MUI)** (Implements the Google Material Design standard)
* **State Management:** **React Context API** (Lightweight state handling)
* **HTTP Client:** **Axios** (For communicating with the Backend API)
* **Node Environment:** `node:18-alpine` (Lightweight Docker image)

### 🧠 Backend (API & Logic)
Responsible for data processing, security, and administrative tasks.
* **Framework:** **Python Django** (v4.x or 5.x)
* **API Toolkit:** **Django REST Framework (DRF)** (Converts Database models to JSON)
* **WSGI Server:** **Gunicorn** (Production-grade server for Python)
* **Data Processing:** **Pandas** (For bulk Excel ingestion of grades/students)
* **Admin Interface:** **Django Admin** (Built-in dashboard for University Staff)
* **Python Environment:** `python:3.9-slim` (Optimized Docker image)

### 🗄 Database (Persistence)
Responsible for storing structured relational data.
* **Engine:** **MySQL 8.0**
* **Why MySQL?**
    * Standard for legacy university systems compatibility.
    * Strong ACID compliance for grade integrity.
    * High availability via Master-Slave replication (DevOps feature).

### 🚦 API Gateway & Routing
Responsible for traffic management and reverse proxying.
* **Technology:** **Nginx** (Latest Stable)
* **Roles:**
    * **Reverse Proxy:** Routes `/api` requests to Django and `/` requests to React.
    * **Static Server:** Serves the compiled React production files (`index.html`, `.css`, `.js`).
    * **Security:** Handles SSL termination (HTTPS) and basic rate limiting.

---

## 3. DevOps & Infrastructure Tools
This project highlights **Cloud-Native** practices suitable for a modern DevOps Engineer.

### 🐳 Containerization
* **Docker:** Used to package every component (Frontend, Backend, Nginx) into portable images.
* **Docker Compose:** Used for the **Local Development Environment** to spin up the entire stack with one command (`docker-compose up`).

### ☸️ Orchestration (Production)
* **Kubernetes (K8s):** The production runtime environment.
    * **Deployments:** For stateless apps (React, Django).
    * **StatefulSets:** For the MySQL database (to ensure data safety).
    * **Services:** ClusterIP for internal talk; NodePort/LoadBalancer for external access.
    * **ConfigMaps/Secrets:** managing `DB_PASSWORD` and API keys securely.

### 🚀 CI/CD (Automation)
* **Platform:** **GitHub Actions** (or Jenkins)
* **Pipeline Stages:**
    1.  **Linting:** Check code quality (Flake8 for Python, ESLint for JS).
    2.  **Build:** Build Docker images.
    3.  **Push:** Push images to Docker Hub / GitHub Container Registry.
    4.  **Deploy:** Update Kubernetes manifest to pull the new image.

---

## 4. Development Tools
* **IDE:** VS Code (with Docker & Python extensions).
* **API Testing:** Postman (for testing Django API endpoints independently).
* **Version Control:** Git / GitHub.
* **Database GUI:** DBeaver or MySQL Workbench (for visual database inspection).

---

## 5. Justification for Technology Choices (Defense Prep)

| Choice | Why we chose it? |
| :--- | :--- |
| **React + Django** | Separating frontend and backend allows us to scale them independently and enables future mobile app integration without rewriting the backend. |
| **MySQL** | chosen for its reliability with structured academic data (Grades/Courses) and widespread use in enterprise environments. |
| **Nginx** | Acts as a single entry point, eliminating CORS issues and improving security by hiding the internal application structure. |
| **Docker** | Solves the "it works on my machine" problem, ensuring the portal runs identically on the developer laptop and the university server. |