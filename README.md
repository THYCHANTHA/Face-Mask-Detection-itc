# Face Mask Detection App

A containerised web application that detects face masks in images or a live webcam feed. A YOLOv8 model performs the detection, a FastAPI backend serves it, a React frontend provides the interface, and PostgreSQL stores a history of detections. It was developed as a team project (see [docs/member_working.md](docs/member_working.md) for the work allocation).

## Introduction

Mask compliance can be checked automatically by detecting faces and classifying them. This project packages a trained YOLOv8 detector behind an API and a browser interface so that anyone can upload a photo or point a webcam at a scene and see the detected faces with their labels and confidence scores.

## Objectives

- Detect face masks in uploaded images and in near-real-time webcam frames.
- Serve the model through a REST API and a modern single-page interface.
- Keep a history of stored detections in a database.
- Package the whole system with Docker so it runs the same way on any machine.

## Main features

| Feature | How it works (from the code) |
|---|---|
| Image upload | The frontend posts the image to `POST /detect/`; the backend runs YOLOv8, saves the annotated image and the detections, and returns them as JSON |
| Live webcam | The frontend captures a frame about once a second and posts it to `POST /detect/?store=false`, so webcam frames are analysed without being saved to the history |
| Detection history | `GET /history/` returns stored detections (filename, detections as JSON, timestamp); the History tab displays them |
| Overlay | Bounding boxes, class names and confidence percentages are drawn over the image in the browser |
| Containerisation | `docker-compose.yml` runs the backend, frontend and database together |

## Technologies

| Layer | Tools |
|---|---|
| Model | YOLOv8 (`ultralytics`), OpenCV (`opencv-python-headless`), Pillow |
| Backend | Python 3.9, FastAPI, Uvicorn, SQLAlchemy, `psycopg2` |
| Database | PostgreSQL 15 |
| Frontend | React, Vite, Tailwind CSS, Axios, Lucide icons |
| Packaging | Docker, Docker Compose |

## Architecture

```
Browser (React + Vite, :3000)
   |  POST /detect/  (image or webcam frame)      GET /history/
   v
FastAPI backend (:8000)  ---- YOLOv8 inference (backend/app/models/best.pt)
   |
   v
PostgreSQL (:5433 on the host)   table: detections(id, filename, detections_data JSON, created_at)
```

Inference uses a confidence threshold of 0.15 (`backend/app/detection.py`).

## Folder structure

```
Face-Mask-Detection-itc/
├── backend/
│   ├── app/
│   │   ├── main.py            # API endpoints and CORS
│   │   ├── detection.py       # YOLOv8 inference
│   │   ├── database.py        # database connection
│   │   ├── models_db.py       # SQLAlchemy model
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── crud.py            # database operations
│   │   └── models/best.pt     # weights loaded by the backend
│   ├── debug_model.py         # prints the model's class names
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                  # React + Vite + Tailwind application
├── database/init.sql          # creates the mask_db database
├── docs/member_working.md     # team work allocation and process
├── scripts/publish_docker.ps1 # builds and pushes the images to Docker Hub
├── docker-compose.yml
├── best.pt                    # an additional weights file (not loaded by the backend)
└── README.md
```

The upload and results folders (`backend/uploads`, `backend/results`) are created at run time and are git-ignored. Two helper files were moved into `docs/` and `scripts/` (contents unchanged); `publish_docker.ps1` uses the current directory, so run it from the repository root.

**About the two `best.pt` files:** the backend loads `backend/app/models/best.pt` (about 11 MB). The `best.pt` in the repository root (about 6 MB) is a different file with a different checksum and is not referenced by any code or configuration.

## Installation and usage

### With Docker (recommended)

Prerequisites: Docker and Docker Compose.

```bash
docker-compose up --build
```

This builds the images, starts PostgreSQL, the backend at `http://localhost:8000` and the frontend at `http://localhost:3000`. Open `http://localhost:3000`. Stop with `Ctrl+C` or `docker-compose down`.

The author's earlier README also mentions pre-built images on Docker Hub (`thychantha/face-mask-backend`, `thychantha/face-mask-frontend`). Their availability was not verified here, and `docker-compose.yml` builds locally rather than using them.

### Without Docker

1. **Database:** install PostgreSQL, create a database named `mask_db`, and set `DATABASE_URL` in `backend/app/database.py` if your credentials differ.
2. **Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```
3. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Vite serves on `http://localhost:5173` by default; the Docker setup uses port 3000.

Browsers only allow webcam access on `localhost` or HTTPS.

## Existing results

**None documented.** The repository contains the trained weights but no training code, dataset description or evaluation metrics, so no performance figures are claimed here.

## Limitations

- No evaluation metrics, training code or dataset information are included.
- `docker-compose.yml` and the fallback value in `backend/app/database.py` contain **development default credentials** (a PostgreSQL password and a matching `DATABASE_URL`) committed in plain text. They are intended for local containers only and must be replaced, preferably with environment variables, before any real deployment.
- The API allows requests from any origin (CORS `*`) and the frontend container runs the Vite development server.
- The frontend's `package.json` is still named `currency-client` (left over from another project).
- No automated tests.
- The pre-built Docker Hub images could not be verified.

## References and acknowledgements

- Model: [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics).
- Developed by a student team; roles and responsibilities are in [docs/member_working.md](docs/member_working.md).
