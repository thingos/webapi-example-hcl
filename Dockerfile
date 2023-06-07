FROM node:18-alpine3.17 AS build
COPY yarn.lock package.json tsconfig.node.json tsconfig.json vite.config.ts  index.html .npmrc postcss.config.js tailwind.config.js .
COPY src ./src
COPY static ./static
RUN --mount=type=secret,id=NPM_TOKEN NPM_TOKEN=$(cat /run/secrets/NPM_TOKEN) yarn install --pure-lockfile
RUN rm .npmrc
RUN yarn build

FROM nginx:alpine as release
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html
# Remove default nginx static assets
RUN rm -rf ./*
# Copy static assets from builder stage
COPY --from=build /public .
EXPOSE 80
# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]
