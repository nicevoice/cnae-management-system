#! /bin/zsh
echo "use admin\n db.auth('$3','$4')\n use $1 \n db.dropDatabase()" | mongo -port=$2
