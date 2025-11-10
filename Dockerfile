#https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/
# --------------> The build image
FROM node:lts AS build
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init
WORKDIR /app
COPY package*.json /app
RUN npm ci --only=production --legacy-peer-deps

# --------------> The final image
FROM node:lts-slim

ENV NODE_ENV production
COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
USER node
WORKDIR /app
COPY --chown=node:node --from=build /app/node_modules /app/node_modules
COPY --chown=node:node . /app
CMD ["dumb-init", "node", "server.js"]