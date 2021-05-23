FROM node:14.17.0-alpine3.10 AS development

WORKDIR /app

COPY package*.json ./

RUN npm install glob rimraf

RUN npm install --only=development

COPY . .

RUN npm run build

FROM node:14.17.0-alpine3.10 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /app/dist ./dist

CMD ["npm", "run", "start:prod"]