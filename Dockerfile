# Use Node.js LTS Slim
FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy files and build
COPY . .
RUN npm run build

# Runner stage
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Copy built assets
COPY --from=builder /app/dist ./dist

# Set production environment
ENV NODE_ENV=production
EXPOSE 3000

# Start server
CMD ["npm", "start"]
