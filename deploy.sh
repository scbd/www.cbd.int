#!/bin/sh

docker build -t localhost:5000/www-cbd-int git@github.com:scbd/www.cbd.int.git

docker push localhost:5000/www-cbd-int
