# Stage1: UI Build
FROM node:16-slim AS ui-build
WORKDIR /usr/src
COPY client/ ./client/
RUN cd client && npm install && npm run build

# Stage2: API Build
FROM node:16-slim AS api-build
WORKDIR /usr/src
COPY server/ ./server/
RUN cd server && npm install && ENVIRONMENT=production npm run build
RUN ls

# Stage3: Package the app
FROM node:16-slim
WORKDIR /root/
COPY --from=ui-build /usr/src/client/dist/client ./client/build
COPY --from=api-build /usr/src/server/dist .
RUN ls

EXPOSE 80

CMD ["node", "api.bundle.js"]