# ! first stage
FROM node:22.18.0-bullseye-slim as builder

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY prisma ./prisma

RUN npm run generate

# Copy only the necessary source directories/files (avoid COPY . . to prevent leaking sensitive data)
COPY src ./src
COPY prisma ./prisma
COPY tsconfig*.json ./
COPY package*.json ./

RUN npm run build

# ! second stage
FROM node:22.18.0-bullseye-slim

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps --only=production

COPY --from=builder /app/dist ./dist

COPY ["./React Apps", "./dist/React Apps"]

COPY ["./templates", "./dist/templates"]

COPY prisma ./prisma

RUN npm run generate

# Create a non-root user for the production stage
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

EXPOSE 8000

CMD ["sh", "-c", "npm run db:deploy && npm run prod"]