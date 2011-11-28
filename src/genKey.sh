#! /bin/zsh
if [ "$1" = "" ]
then echo "error: need a param email."
else ssh-keygen -t rsa -C "$1" -f "/home/heyiyu.pt/.ssh/nae/id_rsa_$2" -N ""
fi
