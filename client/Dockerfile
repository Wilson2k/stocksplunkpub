# Build container for frontend
FROM node:16-slim as build
WORKDIR /usr/src/app

# Install dependencies
COPY package.json .
COPY package-lock.json .
RUN npm ci
 
# Copy the application source
COPY . .

# Build angular app
RUN npm run build

# Server angular app on port 4200 using nginx
FROM nginx:stable-alpine
 
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/client /usr/share/nginx/html
 
EXPOSE 4200