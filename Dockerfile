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
RUN npx prisma generate
RUN npm run build

# Stage 3: Final Image
FROM node:20-alpine
WORKDIR /app

# Copy production dependencies for backend
COPY server/package*.json ./server/
RUN cd server && npm install --production

# Copy built backend and prisma
COPY --from=backend-builder /app/server/dist ./server/dist
COPY --from=backend-builder /app/server/prisma ./server/prisma
COPY --from=backend-builder /app/server/node_modules/.prisma ./server/node_modules/.prisma
COPY --from=backend-builder /app/server/node_modules/@prisma/client ./server/node_modules/@prisma/client

# Copy built frontend
COPY --from=frontend-builder /app/dist ./dist

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Command to run migrations and start server
CMD ["sh", "-c", "cd server && npx prisma migrate deploy && node dist/index.js"]
