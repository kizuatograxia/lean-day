# Build Stage 1: Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Build Stage 2: Backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ .
RUN npm run build

# Stage 3: Final Image
FROM node:20-alpine
WORKDIR /app

# Copy production dependencies for backend
COPY server/package*.json ./server/
RUN cd server && npm install --production

# Copy built backend
COPY --from=backend-builder /app/server/dist ./server/dist

# Copy built frontend
COPY --from=frontend-builder /app/dist ./dist

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Command to start server (DB initialization is handled in index.ts)
CMD ["sh", "-c", "cd server && node dist/index.js"]
