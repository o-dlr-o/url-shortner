<!--suppress HtmlDeprecatedAttribute -->
<p align="center">
    <img alt="Unit Tests" src="https://github.com/o-dlr-o/url-shortner/actions/workflows/main.yml/badge.svg"/>
</p>

| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-100%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-100%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-100%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-100%25-brightgreen.svg?style=flat) |

## Description

Url shortener

## Installation

```bash
$ cp .env.sample .env
$ docker compose up -d db
$ npm install
$ npm run build
```

Alternatively, you can run the whole stack with

```bash
$ docker compose  up api
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
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

## Playing on your own :beach_umbrella:

Once you've started the server, you can send requests to http://localhost:3100.

Don't forget that the project needs up an .env file. For that, simply rename the .env.sample or feel free to create your
own.

You can use the insomnia.json file provided to fill [insomnia](https://insomnia.rest/) with test requests. For that run
insomnia and go to preferences > data and import the file.



