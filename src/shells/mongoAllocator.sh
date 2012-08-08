#! /bin/zsh
echo "use admin\n db.auth('$6','$7')\n use $1 \n db.addUser('$2', '$3')" | mongo -host=$4 -port=$5
