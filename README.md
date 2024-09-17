# html5-to-pdf-with-Puppeteer

## Description

this project is about to Convert HTML5 page to pdf or image with Puppeteer

## Table des Matières

- [started](#1. Getting started)
- [Test](#2. Test)
- [CI](#3. Continuous integration)
- [Deployment](#4. Deployment)
- [follow-up](#5. Deployment follow-up)

## 1. Getting started

1. 1. Configuration

### Install and run on Development env

npm install
npm run start

## 2. Test

npm run test

## 3. Continuous integration

The project is configured to use Bitbucket Pipelines. By default, the pipeline executes the following commands:

- build
- lint
- test:ci

The repository must have the following branches for continuous integration to work:

- `develop` : main project branch
- hand": production delivery branch
- `preprod` : pre-production delivery branch

Version numbers are automatically managed by the pipeline during the pre-production and production delivery stages.
production delivery stages.

### Code quality

Code quality is checked by SonarQube, and the analysis is available on the
server (https://sonarcloud.io).

Developments must be unit-tested and e2e-tested. If test coverage is less than 50%, or if
Sonar has detected too many errors or potential security flaws, the pipeline will be in error and the delivery
delivery cannot be made.

## 4. Deployment

The API is deployed automatically via Bitbucket Pipelines. The `main` and `preprod` branches are deployed
production and pre-production environments, respectively, using docker-compose files and after
having configured the various Portainers (with stacks and .env files).

Access to the api is via the Traefik reverse-proxy, which is configured in the `traefik.*` labels of each
docker-compose.

## 5. Deployment follow-up

### Metrics

Metrics are tracked via prometheus and grafana. The `prom.service.ts` file contains functions for
interact with the application's metrics. It is possible to add custom metrics, but care must be taken when doing so.
attention to
data cardinality](https://grafana.com/blog/2022/02/15/what-are-cardinality-spikes-and-why-do-they-matter/)
to avoid overloading the Prometheus server. More information is available in the [documentation](https://prometheus.io/docs/).
Create a dashboard to track application metrics on [Grafana](https://grafana.s3pweb.io).
