#! /bin/zsh
if [ "$1" = "" ]
then echo "error: need a param email."
else ssh-keygen -t rsa -C "$1" -f "$2" -N ""
fi
