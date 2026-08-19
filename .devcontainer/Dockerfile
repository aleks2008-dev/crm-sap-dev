# syntax=docker/dockerfile:1

ARG VARIANT="20"
FROM mcr.microsoft.com/devcontainers/javascript-node:0-${VARIANT}

# System utilities (run as root)
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl git sqlite3 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# CAP Development Kit — global in image
USER node
RUN npm install -g @sap/cds-dk

WORKDIR /home/node