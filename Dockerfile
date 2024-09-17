# Build dist
FROM node:20.14.0-slim AS dist

WORKDIR /tmp/

COPY package.json package-lock.json tsconfig.json tsconfig.build.json ./

RUN npm install

COPY src/ src/

RUN npm run build

# Build node_modules
FROM node:20.14.0-slim AS node_modules

WORKDIR /tmp/

COPY package.json package-lock.json ./

RUN npm pkg delete scripts.prepare && npm install --omit=dev

# Copy sources
FROM node:20.14.0-slim

LABEL maintainer="S3PWeb <hotline@s3pweb.com>"

# Install dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxss1 \
    libxtst6 \
    libnss3 \
    lsb-release \
    && rm -rf /var/lib/apt/lists/*

# Install dumb-init
RUN wget -O /usr/bin/dumb-init https://github.com/dumb-init/dumb-init/releases/download/v1.2.8/dumb-init_1.2.8_amd64 \
    && chmod +x /usr/bin/dumb-init

USER node

WORKDIR /usr/local/app

COPY --chown=node:node /healthcheck.js ./healthcheck.js
COPY --chown=node:node --from=node_modules /tmp/node_modules ./node_modules
COPY --chown=node:node --from=dist /tmp/dist ./dist

EXPOSE 3080

ENV NODE_ENV production

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s \
  CMD node /usr/local/app/healthcheck.js

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/main.js"]
