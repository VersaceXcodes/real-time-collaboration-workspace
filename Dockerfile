FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application if build script exists
RUN if [ -f "package.json" ] && grep -q "build" package.json; then npm run build; fi

# Expose port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]