#! /bin/bash
kill -9 `cat ./server.pid`
nohup node server >> logs/cnae-web-nohup.log 2>&1 &
