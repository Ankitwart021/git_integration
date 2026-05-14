# Use a recent LTS version of node
# Use a pinned slim image to reduce attack surface
FROM node:22-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy only the necessary source files (avoid COPY . . to prevent inadvertent leakage of
# .env files, private keys, or other sensitive data that may sit in the build context)
COPY public ./public
COPY src ./src
COPY tsconfig*.json ./

# Run as a non-root user for least-privilege execution
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

# # Build the react app
# RUN npm run build

# Serve the build folder on port 3000
# CMD ["npx", "serve", "-s", "build", "-l", "3000"]
CMD ["npm", "run", "dev"]
