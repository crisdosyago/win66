#!/bin/bash

trap 'kill $BGPID; exit 0;' SIGINT
trap 'kill $BGPID; exit 0;' SIGKILL
trap 'kill $BGPID; exit 0;' INT
trap 'kill $BGPID; exit 0;' KILL

sudo node -r esm server.js &
BGPID=$!

cd docviewer
./run.sh

