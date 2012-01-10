#! /bin/zsh
echo "use admin\n db.auth('$5','$6')\n use $1 \n db.addUser('$2', '$3')" | mongo -port=$4
