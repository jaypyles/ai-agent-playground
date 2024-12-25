# Node Builder
FROM node:20-alpine as nodebuilder

WORKDIR /frontend

COPY frontend/public /frontend/public
COPY frontend/src /frontend/src
COPY frontend/tsconfig.json /frontend/tsconfig.json
COPY frontend/tailwind.config.ts /frontend/tailwind.config.ts
COPY frontend/next.config.ts /frontend/next.config.ts
COPY frontend/postcss.config.mjs /frontend/postcss.config.mjs
COPY frontend/package.json /frontend/package.json
COPY frontend/package-lock.json /frontend/package-lock.json

RUN npm install

RUN npm run build

# Python Builder
FROM python:3.11-slim

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    supervisor \
    uvicorn \
    libglib2.0-0 \
    libnss3 \
    libnspr4 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libexpat1 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libxcb1 \
    libxkbcommon0 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libatspi2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install nvm (Node Version Manager)
ENV NVM_DIR=/root/.nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js using nvm
RUN bash -c "source $NVM_DIR/nvm.sh && nvm install 20.11.0 && nvm use 20.11.0 && nvm alias default 20.11.0"

# Ensure the Node.js binary is available
ENV PATH=$NVM_DIR/versions/node/v20.11.0/bin:$PATH

RUN node --version
RUN npm --version

WORKDIR /app

RUN python -m pip --no-cache-dir install pdm

COPY pyproject.toml /app/pyproject.toml
COPY pdm.lock /app/pdm.lock

# install dependencies
RUN pdm install

RUN pdm run playwright install

COPY src/ /app/src

WORKDIR /frontend

COPY --from=nodebuilder /frontend/public /frontend/public
COPY --from=nodebuilder /frontend/src /frontend/src
COPY --from=nodebuilder /frontend/tsconfig.json /frontend/tsconfig.json
COPY --from=nodebuilder /frontend/tailwind.config.ts /frontend/tailwind.config.ts
COPY --from=nodebuilder /frontend/next.config.ts /frontend/next.config.ts
COPY --from=nodebuilder /frontend/postcss.config.mjs /frontend/postcss.config.mjs
COPY --from=nodebuilder /frontend/package.json /frontend/package.json
COPY --from=nodebuilder /frontend/package-lock.json /frontend/package-lock.json
COPY --from=nodebuilder /frontend/node_modules /frontend/node_modules
COPY --from=nodebuilder /frontend/.next /frontend/.next

WORKDIR /

ENV PYTHONPATH=/app/src:$PYTHONPATH

COPY supervisor.conf /etc/supervisor/supervisord.conf
COPY start.sh /start.sh