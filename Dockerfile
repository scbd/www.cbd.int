FROM node:20.12.2-alpine3.19

RUN apk update  -q && \
    apk upgrade -q && \
    apk add     -q --no-cache bash git openssh

RUN apk add --update curl && \
    rm -rf /var/cache/apk/*

WORKDIR /usr/src/app

COPY package.json package-lock.json .npmrc ./

RUN npm install -q

COPY . ./

RUN npm run build

ENV PORT 8000

EXPOSE 8000

ARG COMMIT
ENV COMMIT $COMMIT

CMD ["node", "server"]
