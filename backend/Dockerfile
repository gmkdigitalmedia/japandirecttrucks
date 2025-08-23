# Development Dockerfile for Backend
FROM node:18-alpine

WORKDIR /app

# Install development dependencies
RUN apk add --no-cache \
    vips-dev \
    python3 \
    make \
    g++ \
    libc6-compat

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create directories
RUN mkdir -p /app/public/images/vehicles
RUN mkdir -p /app/logs

# Expose port
EXPOSE 3002

# Use simple server instead of TypeScript version
CMD ["node", "simple-server.js"]