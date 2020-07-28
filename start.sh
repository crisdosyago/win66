#!/bin/bash

trap 'sudo kill $BGPID; exit 0;' SIGINT
trap 'sudo kill $BGPID; exit 0;' SIGKILL
trap 'sudo kill $BGPID; exit 0;' INT
trap 'sudo kill $BGPID; exit 0;' KILL

port=$1

sudo node -r esm server.js $port &
BGPID=$!

cd docviewer
sudo -u $(logname) ./run.sh 8090

wait

