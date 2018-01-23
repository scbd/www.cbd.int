FROM node:8-alpine

RUN apk update  -q && \
    apk upgrade -q && \
    apk add     -q --no-cache bash git openssh

WORKDIR /usr/src/app

COPY package.json .npmrc ./

RUN npm install -q
RUN npm build -q


COPY . ./

ENV PORT 8000

EXPOSE 8000

ARG COMMIT
ENV COMMIT $COMMIT

CMD ["node", "server"]
