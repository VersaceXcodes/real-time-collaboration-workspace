FROM node:18-alpine

WORKDIR /app

# Copy backend package files first
COPY backend/package*.json ./backend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci --omit=dev

# Copy backend source code
COPY backend/ ./

# Build the backend if build script exists
RUN if grep -q "build" package.json; then npm run build; fi

# Expose port
EXPOSE 8080

# Start the backend application
CMD ["npm", "start"]