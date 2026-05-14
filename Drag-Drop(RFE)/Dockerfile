# State 1: Build react app
FROM node:22-alpine as build-stage

WORKDIR /app

COPY package*.json ./

RUN ["npm", "install"]

COPY . .

RUN ["npm", "run", "build"]

# Stage 2: Serve built react app with nginx
FROM nginx:1.27.0-alpine as production-stage

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build-stage /app/build .

# Add the Nginx configuration to handle client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the runtime injection script into the container
COPY env.sh /docker-entrypoint.d/env.sh

RUN dos2unix /docker-entrypoint.d/env.sh
RUN chmod +x /docker-entrypoint.d/env.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]