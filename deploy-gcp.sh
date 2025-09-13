#!/bin/bash

# Set your GCP project ID
PROJECT_ID="your-project-id"
REGION="us-central1"

echo "Deploying to Google Cloud Platform..."

# 1. Install gcloud CLI if not installed
if ! command -v gcloud &> /dev/null; then
    echo "Please install Google Cloud SDK first:"
    echo "https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# 2. Authenticate and set project
gcloud auth login
gcloud config set project $PROJECT_ID

# 3. Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable sqladmin.googleapis.com

# 4. Create Cloud SQL instance for PostgreSQL
echo "Creating Cloud SQL PostgreSQL instance..."
gcloud sql instances create gps-trucks-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=$REGION

# 5. Create database and user
gcloud sql databases create gps_trucks_japan --instance=gps-trucks-db
gcloud sql users set-password gp --instance=gps-trucks-db --password=Megumi12

# 6. Build and deploy using Cloud Build
gcloud builds submit --config cloudbuild.yaml .

# 7. Get the service URLs
echo "Getting service URLs..."
BACKEND_URL=$(gcloud run services describe gps-backend --region=$REGION --format="value(status.url)")
FRONTEND_URL=$(gcloud run services describe gps-frontend --region=$REGION --format="value(status.url)")

echo "Deployment complete!"
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""
echo "Next steps:"
echo "1. Update your domain DNS to point to: $FRONTEND_URL"
echo "2. Configure Cloud CDN for better performance"
echo "3. Set up Cloud Armor for DDoS protection"