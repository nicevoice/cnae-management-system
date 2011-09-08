#!/bin/sh
#usage: ./mongoDelector.sh dbName
echo "use admin\n db.auth('deadhorse','901022')\n use $1 \n db.dropDatabase()" | mongo