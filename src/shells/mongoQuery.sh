#! /bin/zsh
echo "use $1\n db.auth('$2','$3')\n $4\n" | mongo -port=$5
