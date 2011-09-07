#!/bin/zsh
#usage: ./mongoDelector.sh dbName
echo "use admin\n db.auth('cnae','edpCnae')\n use $1 \n db.dropDatabase()" | mongo -port=21007
