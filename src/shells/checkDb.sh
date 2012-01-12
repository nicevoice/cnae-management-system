#!/bin/zsh
#usage: ./mongoQuery.sh dbName dbUserName dbPassword dbQuery 
echo "use nae_db\n db.auth('$2','$3')\n $1\n" | mongo -port=27017
