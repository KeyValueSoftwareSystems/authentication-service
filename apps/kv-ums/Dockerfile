FROM nikolaik/python-nodejs:python3.8-nodejs14-alpine as build-stage

WORKDIR /app

COPY . .

RUN npm install glob rimraf

RUN npm install -g nx

RUN npm install

RUN nx run kv-ums:build:production

FROM nginx

COPY --from=build-stage /app/dist/apps/kv-ums/ /usr/share/nginx/html