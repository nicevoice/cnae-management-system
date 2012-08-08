#! /bin/zsh
echo "use admin\n db.auth('$4','$5')\n use $1 \n db.dropDatabase()" | mongo -host=$2 -port=$3
