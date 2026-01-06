# ---------- build stage ----------
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# ---------- production stage ----------
FROM nginx:alpine

# remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# copy custom config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# copy built frontend
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
