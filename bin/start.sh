#! /bin/bash
dir1=`dirname $0`
dir2=`dirname $dir1`
cd $dir2
test ! -d logs && mkdir -p logs
test ! -d temp && mkdir -p temp
cd logs
test ! -e cnae-web-nohup.log && touch cnae-web-nohup.log
cd ../src/public
test ! -d download && mkdir -p download
cd ../../
nohup node ./src/server >> ./logs/cnae-web-nohup.log 2>&1 &
cd $HOME/.ssh
test ! -d nae && mkdir -p nae
sleep 1
curl localhost:2013/status
