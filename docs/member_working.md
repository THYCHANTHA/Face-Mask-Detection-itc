# Face Mask Detection Project - Work Allocation & Process Flow

## Project Team

**Group 5**

- **Leader:** THY CHANTHA
- **Member:** Roeun Sovandeth
- **Member:** San Kimheang
- **Member:** Sem Yuthearylyhour
- **Member:** Siv Lyheng
- **Member:** TAING THAITHEANG

---

## Project Workflow & Task Distribution

This document outlines the workflow and specific responsibilities for each team member to ensure the successful development and deployment of the Face Mask Detection application.

### 1. **THY CHANTHA (Group Leader & Lead Architect)**

**Role:** Project Management, System Architecture, & Final Integration.

- **Responsibilities:**
  - **Repository Setup:** Initialize Git, configure `.gitignore`, and manage branches (`main`, `dev`).
  - **Docker Orchestration:** Create and maintain `docker-compose.yml`, ensure all services (Frontend, Backend, DB) communicate correctly.
  - **System Architecture:** Define the overall structure (FastAPI + React + PostgreSQL).
  - **Integration:** Merge code from all members and resolve conflicts.
  - **Final Review:** Ensure the application meets requirements (Real-time detection, Dockerized).

### 2. **San Kimheang (AI & Computer Vision Engineer)**

**Role:** AI Model Management & Inference Logic.

- **Responsibilities:**
  - **YOLOv8 Implementation:** Handle the loading of the `best.pt` model.
  - **Inference Logic (`detection.py`):** Write the core Python function to process images/frames and return bounding boxes.
  - **Optimization:** Tune confidence thresholds (e.g., `conf=0.15`) for best real-time performance.
  - **Image Processing:** Handle OpenCV logic for drawing boxes and saving annotated results to the `results/` folder.

### 3. **Roeun Sovandeth (Backend Developer)**

**Role:** API Development & File Handling.

- **Responsibilities:**
  - **FastAPI Setup:** Initialize the app in `main.py` and configure CORS.
  - **Endpoints:** Develop the `/detect/` POST endpoint for uploads and the `/history/` GET endpoint.
  - **File Management:** implement logic to save uploaded files to `uploads/` and clean up temporary webcam frames.
  - **Response Formatting:** Ensure API returns JSON data matching the Frontend's expectation (e.g., `detections_data`).

### 4. **TAING THAITHEANG (Database Engineer)**

**Role:** Database Design & Data Persistence.

- **Responsibilities:**
  - **PostgreSQL Setup:** Configure the `db` service in Docker and the `init.sql` script.
  - **ORM Modeling:** Create SQLAlchemy models in `models_db.py` (Tables for specific detections).
  - **Schemas:** Define Pydantic schemas in `schemas.py` for data validation.
  - **CRUD Operations:** Write `crud.py` functions to save and retrieve detection history.

### 5. **Sem Yuthearylyhour (Frontend UI/UX Designer)**

**Role:** User Interface Design & Styling.

- **Responsibilities:**
  - **Tailwind CSS System:** Configure global styles, fonts, and color palette (Dark mode theme).
  - **Component Design:** Build the visual layout for the Navbar, Upload Area, and History Table.
  - **Responsive Layout:** Ensure the app looks good on different screen sizes.
  - **Animations:** Add loading states (scanning animations) and hover effects for a premium feel.

### 6. **Siv Lyheng (Frontend Logic Developer)**

**Role:** React Logic & Client-Side Integration.

- **Responsibilities:**
  - **Webcam Integration:** Implement `react-webcam` or standard HTML5 video logic to capture live frames.
  - **State Management:** Handle `useState` and `useEffect` in `App.jsx` for switching tabs and managing camera status.
  - **API Connection:** Use Axios to send images/frames to the backend and handle responses.
  - **Overlay Rendering:** Implement the dynamic drawing of bounding boxes over the video/image based on backend data.

---

## Development Roadmap

1.  **Phase 1: Foundation (Week 1)**

    - **Chantha:** Set up Docker and Git repo.
    - **Thaitheang:** Design Database Schema.
    - **Kimheang:** Test YOLO model locally.

2.  **Phase 2: Core Development (Week 2)**

    - **Sovandeth:** Build API endpoints.
    - **Yuthearylyhour:** Build Static UI (HTML/CSS).
    - **Lyheng:** Build React Components logic.

3.  **Phase 3: Integration (Week 3)**

    - **Chantha & Sovandeth:** Connect Backend to Database.
    - **Lyheng & Kimheang:** Connect Frontend Webcam to Backend Inference.
    - **All:** Test "End-to-End" flow (Camera -> Detect -> Display).

4.  **Phase 4: Finalization (Week 4)**
    - **Yuthearylyhour:** Polish UI animations.
    - **Chantha:** Final Docker Build & README documentation.
    - **All:** Final Bug fixes and Presentation preparation.
