#!/bin/sh

export DOCKER_HOST=tcp://localhost:2375

docker build -t registry.infra.cbd.int:5000/www-cbd-int .

docker push registry.infra.cbd.int:5000/www-cbd-int
