# authentication-service

# CI
Dummy commit to start the CI

## Description

[Auth] To provide all authentication and authorization related APIs

## Installation

```bash
$ npm install
```

## Running the app

```bash
Rename env.sample to .env and enter all the values
Rename docker.env.sample to docker.env and enter all the values

# development
* update .env POSTGRES_HOST=postgres
$ docker-compose up

# production
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
