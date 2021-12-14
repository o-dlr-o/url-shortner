FROM node:16-alpine as builder

ENV NODE_ENV build

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
USER node
WORKDIR /home/node/app

COPY --chown=node:node . /home/node/app

RUN npm install \
    && npm run build

# ---

FROM node:16-alpine

ENV NODE_ENV production

USER node
WORKDIR /home/node/app

COPY  --from=builder /home/node/app/package*.json /home/node/app/
COPY  --from=builder /home/node/app/ormconfig-docker.json /home/node/app/ormconfig.json
COPY  --from=builder /home/node/app/dist/ /home/node/app/dist/

RUN npm install

EXPOSE 3000
ENTRYPOINT ["npm", "run", "start:prod"]

