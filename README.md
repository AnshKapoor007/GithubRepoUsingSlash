## Description

Creating GitHub repo by Slack slash commands using NestJS

## Installation

```bash
$ npm install
```

## Pre Processing

-> Create a new GitHub OAuth Application.
-> Edit the .env file and manifest.yml as shown.
-> Create a new Slack app using the edited manifest.yml.
-> Edit the .env file.
-> Run the slash commands.

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