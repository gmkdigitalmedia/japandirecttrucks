#!/bin/bash

# GCP Setup Script for GPS Trucks Japan
echo "Setting up GCP for GPS Trucks Japan deployment..."

# Configuration
PROJECT_ID="gps-trucks-japan"
REGION="asia-northeast1"
ZONE="asia-northeast1-a"

# Authenticate
echo "Authenticating with Google Cloud..."
gcloud auth login

# Create or select project
echo "Creating/selecting project..."
gcloud projects create $PROJECT_ID --name="GPS Trucks Japan" 2>/dev/null || true
gcloud config set project $PROJECT_ID

# Enable billing (manual step required)
echo "Please enable billing for project $PROJECT_ID at:"
echo "https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID"
read -p "Press enter when billing is enabled..."

# Enable required APIs
echo "Enabling required APIs..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable compute.googleapis.com

# Create service account for GitHub Actions
echo "Creating service account for GitHub Actions..."
gcloud iam service-accounts create github-actions \
    --display-name="GitHub Actions Deploy"

# Grant permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"

# Create and download key
echo "Creating service account key..."
gcloud iam service-accounts keys create ./gcp-key.json \
    --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com

# Create Cloud SQL instance
echo "Creating Cloud SQL instance (this takes ~5 minutes)..."
gcloud sql instances create gps-trucks-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=$REGION \
    --network=default \
    --no-backup

# Create database and set password
gcloud sql databases create gps_trucks_japan --instance=gps-trucks-db
gcloud sql users set-password postgres --instance=gps-trucks-db --password=Megumi12

# Get connection name
CONNECTION_NAME=$(gcloud sql instances describe gps-trucks-db --format="value(connectionName)")

# Deploy containers
echo "Building and deploying containers..."

# Backend
cd backend
gcloud builds submit --tag gcr.io/$PROJECT_ID/gps-backend
gcloud run deploy gps-backend \
    --image gcr.io/$PROJECT_ID/gps-backend \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --port 3002 \
    --add-cloudsql-instances $CONNECTION_NAME \
    --set-env-vars "DATABASE_URL=postgresql://postgres:Megumi12@localhost/gps_trucks_japan?host=/cloudsql/$CONNECTION_NAME,NODE_ENV=production"

# Get backend URL
BACKEND_URL=$(gcloud run services describe gps-backend --region $REGION --format 'value(status.url)')

# Frontend
cd ../frontend
gcloud builds submit --tag gcr.io/$PROJECT_ID/gps-frontend
gcloud run deploy gps-frontend \
    --image gcr.io/$PROJECT_ID/gps-frontend \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --port 3000 \
    --set-env-vars "NEXT_PUBLIC_API_URL=$BACKEND_URL,NODE_ENV=production"

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe gps-frontend --region $REGION --format 'value(status.url)')

echo ""
echo "==============================================="
echo "Deployment Complete!"
echo "==============================================="
echo "Frontend URL: $FRONTEND_URL"
echo "Backend URL: $BACKEND_URL"
echo "Cloud SQL Connection: $CONNECTION_NAME"
echo ""
echo "GitHub Secrets to add:"
echo "1. GCP_PROJECT_ID: $PROJECT_ID"
echo "2. GCP_SA_KEY: (contents of gcp-key.json)"
echo "3. CLOUD_SQL_CONNECTION: $CONNECTION_NAME"
echo "4. DATABASE_URL: postgresql://postgres:Megumi12@localhost/gps_trucks_japan?host=/cloudsql/$CONNECTION_NAME"
echo ""
echo "To point your domain:"
echo "1. Go to Cloud Run console"
echo "2. Click 'Manage Custom Domains'"
echo "3. Add japandirecttrucks.com"
echo "==============================================="