Task Management System (Full-Stack REST API & React SPA)A modern, production-ready Full-Stack Task Management System built using FastAPI, React (Vite), MySQL, and SQLAlchemy. The application supports end-to-end task life-cycle operations with JWT authentication, custom priority scheduling, duplicate title detection, real-time title search, and native browser reminder notifications.📌 FeaturesJWT Authentication: Secure user registration and login with bcrypt-hashed passwords.Complete Task CRUD: Create, read, update (edit), and delete tasks tied directly to authenticated user accounts.Task Prioritization & Mandatory Scheduling: Strict schema requiring priority levels (low, medium, high) along with start_time and end_time.Smart Validation & Duplicate Warning: Real-time frontend alerts and backend HTTP 409 conflict checks preventing duplicate task titles.Live Search & Filter: Instant client-side search by title combined with priority query filters.Active Task Reminders: Browser notifications and alerts triggering when a task's start time approaches.Interactive API Documentation: Built-in Swagger UI and ReDoc endpoints powered by FastAPI.🛠️ Tech StackBackend: Python, FastAPI, SQLAlchemy, Pydantic, PyMySQL, Python-JOSE, Passlib/BcryptFrontend: React, Vite, AxiosDatabase: MySQLTools: Uvicorn, Swagger UI📂 Project Directory StructurePlaintextTask_Management_System/
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
├── .env.example              # Sample environment configuration
├── .gitignore
├── requirements.txt          # Backend Python dependencies
└── main.py                   # FastAPI server entry point
🚀 Getting Started1. PrerequisitesPython 3.10+Node.js 18+ and npmMySQL Server2. Backend SetupClone the repository:Bashgit clone https://github.com/DharunRS/Task_Management_System.git
cd Task_Management_System
Create and activate a virtual environment:Windows (PowerShell):PowerShellpython -m venv venv
.\venv\Scripts\Activate.ps1
Linux/macOS:Bashpython3 -m venv venv
source venv/bin/activate
Install dependencies:Bashpip install -r requirements.txt
Configure Environment Variables:Create a .env file in the root folder:Code snippetDATABASE_URL=mysql+pymysql://<DB_USER>:<DB_PASSWORD>@localhost:3306/<DB_NAME>
JWT_SECRET=supersecretkey
JWT_ALGORITHM=HS256
Run the FastAPI server:Bashuvicorn main:app --reload
API root: [http://127.0.0.1:8000](http://127.0.0.1:8000)Swagger UI Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)3. Frontend SetupNavigate to the frontend directory:Bashcd task-frontend
Install node modules:Bashnpm install
Start the Vite development server:Bashnpm run dev
Frontend Application: http://localhost:5173🔌 API Endpoints SummaryMethodEndpointDescriptionAuth RequiredPOST/auth/registerRegister a new user accountNoPOST/auth/loginAuthenticate user & return JWT tokenNoGET/tasks/Retrieve user tasks (supports priority & search)YesPOST/tasks/Create a new scheduled taskYesGET/tasks/{id}Fetch specific task by IDYesPUT/tasks/{id}Update existing taskYesDELETE/tasks/{id}Remove a taskYes📄 LicenseThis project is licensed under the MIT License.
