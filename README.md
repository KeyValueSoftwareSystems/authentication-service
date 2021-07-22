# authentication-service

<p align="center">
<a href="https://gitlab.com/keyvalue-systems/authentication-service/-/pipelines" target="_blank"><img src="https://gitlab.com/keyvalue-systems/authentication-service/badges/master/pipeline.svg?key_text=build" alt="build status"/></a>
</p>

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
