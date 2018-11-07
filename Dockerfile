FROM node:10-alpine

LABEL name "Haruna"
LABEL version "0.1.0"
LABEL maintainer "iCrawl <icrawltogo@gmail.com>"

WORKDIR /usr/src/haruna

COPY package.json yarn.lock ./

RUN apk add --update \
&& apk add --no-cache ca-certificates \
&& apk add --no-cache --virtual .build-deps git curl build-base python g++ make \
&& yarn install \
&& apk del .build-deps

COPY . .

RUN yarn build

ENV NODE_ENV= \
	ID= \
	OWNERS= \
	TOKEN= \
	LAVALINK_PASSWORD= \
	LAVALINK_REST= \
	LAVALINK_WS= \
	DB= \
	REDIS= \
	RAVEN=

CMD ["node", "dist/haruna.js"]
