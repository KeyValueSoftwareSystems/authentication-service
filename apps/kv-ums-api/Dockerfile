FROM nikolaik/python-nodejs:python3.8-nodejs14-alpine

WORKDIR /app

COPY . .

RUN npm install glob rimraf

RUN npm install -g nx

RUN npm install

RUN nx run kv-ums-api:build

CMD ["nx", "run", "kv-ums-api:serve"]