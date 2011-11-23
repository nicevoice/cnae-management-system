#! /bin/sh
echo 'q' | top -p `cat ../server.pid`
