# Build container for backend
FROM node:16-slim
WORKDIR /usr/src/app

# Install dependencies
COPY package.json .
COPY package-lock.json .
COPY .env .env
RUN npm ci
 
# Copy the application source
COPY . .

# Expose port
EXPOSE 8080

# Start backend express server
CMD ["npm", "run", "server"]