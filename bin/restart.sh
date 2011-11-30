#! /bin/bash
kill -9 `cat ./src/server.pid`
nohup node ./src/server >> ./logs/cnae-web-nohup.log 2>&1 &
