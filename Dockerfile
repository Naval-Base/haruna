FROM node:10-alpine
LABEL name "Haruna"
LABEL version "0.1.0"
LABEL maintainer "iCrawl <icrawltogo@gmail.com>"
WORKDIR /usr/src/haruna
COPY package.json pnpm-lock.yaml ./
RUN apk add --update \
&& apk add --no-cache ca-certificates \
&& apk add --no-cache --virtual .build-deps git curl build-base python g++ make \
&& curl -L https://unpkg.com/@pnpm/self-installer | node \
&& pnpm i \
&& apk del .build-deps
COPY . .
RUN pnpm run build
ENV NODE_ENV= \
	ID= \
	OWNERS= \
	TOKEN= \
	LAVALINK_PASSWORD= \
	LAVALINK_REST= \
	LAVALINK_WS= \
	DB= \
	REDIS= \
	SENTRY=
ENV VERSION=
CMD ["node", "dist/haruna.js"]

