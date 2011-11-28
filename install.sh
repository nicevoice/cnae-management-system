#!/bin/sh

nae=client.tar.gz
install_path=/usr/local/lib/nae
bin_path=/usr/local/bin/

node_check=`which node`

if [ -z $node_check ] ;then
	echo 'please install node first ! '
	exit
fi

if [ -d $install_path ] ;then
		echo "$install_path already exists, continue will delete these folder . \ncontinue ? [yes|no ,default no]";
		read confirm
		if [ "$confirm" != "yes" ] ;then
			echo "exist install !"
			exit
		fi 
		rm -r $install_path
fi

# make dir for lib
mkdir -p $install_path

cd $install_path 
# download package
wget http://cnodejs.net/download/$nae

# extract file
tar zfx $nae
cp -r nae-client/* ./
rm -rf nae-client
chmod -R 755 ./*

# make link
cd $bin_path
if [ -f nae ] ;then
	echo "command nae already exist!";
	echo `ls -al nae | awk '{print $10}'`
	echo "continue install ? [yes | no ,default no]"
	read confirm
	if [ "$confirm" = "yes" ] ;then
		rm nae 
		ln -s $install_path/nae nae
		chmod 755 nae
		echo "[success] nae installed"
	else
		echo "[fail] install failed"
	fi
fi 