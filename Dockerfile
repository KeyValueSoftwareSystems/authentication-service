FROM node:14.17.0-alpine3.10

WORKDIR /app

COPY . .

RUN npm install glob rimraf

RUN npm install

RUN npm run build

CMD ["npm", "run", "start:prod"]