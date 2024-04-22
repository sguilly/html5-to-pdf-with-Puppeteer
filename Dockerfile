#
# Build dist
#
FROM node:20.12.2-alpine AS dist

WORKDIR /tmp/

COPY .npmrc package.json package-lock.json tsconfig.json tsconfig.build.json ./

RUN npm install

COPY src/ src/

RUN npm run build

#
# Build node_modules
#
FROM node:20.12.2-alpine AS node_modules

WORKDIR /tmp/

COPY .npmrc package.json package-lock.json ./

RUN npm pkg delete scripts.prepare && npm install --omit=dev

#
# Copy sources
#
FROM node:20.12.2-alpine

LABEL maintainer="S3PWeb <hotline@s3pweb.com>"

RUN apk --no-cache add dumb-init

USER node

WORKDIR /usr/local/app

COPY --chown=node:node /healthcheck.js ./healthcheck.js
COPY --chown=node:node --from=node_modules /tmp/node_modules ./node_modules
COPY --chown=node:node --from=dist /tmp/dist ./dist

EXPOSE 3000

ENV NODE_ENV production

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s \
  CMD node /usr/local/app/healthcheck.js

CMD ["dumb-init", "node", "dist/main.js"]
