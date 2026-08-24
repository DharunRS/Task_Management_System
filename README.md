# Task Management System (Full-Stack REST API & React SPA)

A modern, production-ready Full-Stack Task Management System built using **FastAPI**, **React (Vite)**, **MySQL**, and **SQLAlchemy**. The application supports end-to-end task life-cycle operations with JWT authentication, custom priority scheduling, duplicate title detection, real-time title search, and native browser reminder notifications.

---

## 📌 Features

* **JWT Authentication**: Secure user registration and login with bcrypt-hashed passwords.
* **Complete Task CRUD**: Create, read, update (edit), and delete tasks tied directly to authenticated user accounts.
* **Task Prioritization & Mandatory Scheduling**: Strict schema requiring priority levels (`low`, `medium`, `high`) along with `start_time` and `end_time`.
* **Smart Validation & Duplicate Warning**: Real-time frontend alerts and backend HTTP 409 conflict checks preventing duplicate task titles.
* **Live Search & Filter**: Instant client-side search by title combined with priority query filters.
* **Active Task Reminders**: Browser notifications and alerts triggering when a task's start time approaches.
* **Interactive API Documentation**: Built-in Swagger UI and ReDoc endpoints powered by FastAPI.

---

## 🛠️ Tech Stack

* **Backend**: Python, FastAPI, SQLAlchemy, Pydantic, PyMySQL, Python-JOSE, Bcrypt
* **Frontend**: React, Vite, Axios
* **Database**: MySQL
* **Tools & Server**: Uvicorn, Swagger UI

---

## 📂 Project Directory Structure

```text
Task_Management_System/
│
├── app/
│   ├── __init__.py
│   ├── config.py             # Environment configurations
│   ├── database.py           # Database engine & session setup
│   ├── models.py             # SQLAlchemy ORM database models
│   ├── schemas.py            # Pydantic data schemas & validation
│   ├── auth.py               # Password hashing & JWT token handling
│   └── routers/
│       ├── __init__.py
│       ├── auth.py           # User registration & login endpoints
│       └── tasks.py          # Task CRUD & query filter endpoints
│
├── task-frontend/            # React Single Page Application (Vite)
│   ├── src/
│   │   ├── api.js            # Configured Axios instance with interceptors
│   │   ├── Auth.jsx          # Login & Registration component
│   │   ├── App.jsx           # Task dashboard, scheduling & reminders
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── requirements.txt          # Backend Python dependencies
└── main.py                   # FastAPI server entry point
