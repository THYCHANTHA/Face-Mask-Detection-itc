# Face Mask Detection App

This project is a web application that detects face masks in real-time using a webcam or from uploaded images. It uses a YOLOv8 model for detection, a FastAPI backend, a React frontend, and a PostgreSQL database for storing detection history. The entire application is containerized using Docker.

## Project Structure

```
Face-Mask-Detection/
├── backend/                # FastAPI Backend
│   ├── app/
│   │   ├── main.py         # API entry point & endpoints
│   │   ├── detection.py    # YOLOv8 inference logic
│   │   ├── database.py     # Database connection setup
│   │   ├── models_db.py    # SQLAlchemy database models
│   │   ├── schemas.py      # Pydantic data schemas
│   │   └── crud.py         # Database CRUD operations
│   ├── uploads/            # Directory for uploaded/processed images
│   ├── Dockerfile          # Backend Docker configuration
│   └── requirements.txt    # Python dependencies
│
├── frontend/               # React Frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   ├── main.jsx        # React entry point
│   │   └── index.css       # Global styles (Tailwind CSS)
│   ├── Dockerfile          # Frontend Docker configuration
│   ├── tailwind.config.js  # Tailwind CSS config
│   └── vite.config.js      # Vite config
│
├── database/               # Database Configuration
│   └── init.sql            # Database initialization script
│
├── docker-compose.yml      # Docker Compose orchestration
└── best.pt                 # YOLOv8 Trained Model Weights
```

## Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your machine.
- Alternatively, Python 3.9+ and Node.js 18+ for local non-Docker development.

## Setup & Running with Docker (Recommended)

1.  **Clone the repository** (if applicable) or navigate to the project folder:
    ```bash
    cd path/to/Face-Mask-Detection
    ```

2.  **Build and Start the Containers:**
    Run the following command in the root directory:
    ```bash
    docker-compose up --build
    ```
    This command will:
    - Build the backend and frontend images.
    - Start the PostgreSQL database container.
    - Start the FastAPI backend at `http://localhost:8000`.
    - Start the React frontend at `http://localhost:3000`.

3.  **Access the Application:**
    Open your browser and go to `http://localhost:3000`.

4.  **Stop the Application:**
    Press `Ctrl+C` in the terminal or run:
    ```bash
    docker-compose down
    ```

## Manual Setup (Without Docker)

### 1. Database Setup
Ensure you have PostgreSQL installed and running. Create a database named `mask_db`. Update the `DATABASE_URL` in `backend/app/database.py` if your credentials differ from the defaults.

### 2. Backend Setup
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the server:
    ```bash
    uvicorn app.main:app --reload
    ```
    The backend will be available at `http://localhost:8000`.

### 3. Frontend Setup
1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173` (by default with Vite) or `http://localhost:3000` depending on config.

## Features

- **Real-time Detection:** Use your webcam to detect face masks live.
- **Image Upload:** Upload images for detection.
- **History:** View a history of past detections (saved to the database).
- **Responsive Design:** Modern UI built with React and Tailwind CSS.
