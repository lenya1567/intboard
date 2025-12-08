FROM node:22 AS build

WORKDIR /app

COPY ./frontend/package*.json ./

RUN npm ci

COPY ./frontend .

RUN npm run build

#базовый образ
FROM nginx:alpine 

COPY --from=build /app/dist/ /build

COPY --from=build /app/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]