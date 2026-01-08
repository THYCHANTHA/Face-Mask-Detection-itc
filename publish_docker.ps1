# Docker Publish Script
# Usage: ./publish_docker.ps1

Write-Host "Logging in to Docker Hub (if not already logged in)..."
docker login

Write-Host "Building images (to ensure latest version)..."
docker-compose build

Write-Host "Tagging images..."
docker tag mask_backend thychantha/face-mask-backend:latest
docker tag mask_frontend thychantha/face-mask-frontend:latest

Write-Host "Pushing Backend..."
docker push thychantha/face-mask-backend:latest

Write-Host "Pushing Frontend..."
docker push thychantha/face-mask-frontend:latest

Write-Host "Done! Images are live on Docker Hub."
