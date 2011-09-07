#!/bin/sh
#usage: ./mongoAllocator.sh dbName dbUserName dbPassword
echo "use admin\n db.auth('cnae','edpCnae')\n use $1 \n db.addUser('$2', '$3')" | mongo -port=21007
