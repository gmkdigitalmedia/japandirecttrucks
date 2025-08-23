# Development Dockerfile for Admin Panel
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Expose port
EXPOSE 3001

# Development command (will be overridden by docker-compose)
CMD ["npm", "run", "dev"]