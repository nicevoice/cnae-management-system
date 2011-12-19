#! /bin/sh
# check dir and start mongo
# must first change the dir to which you want

#make sure root dir is exist
root_dir=$HOME/cnae
data_dir=$root_dir/cloudengine/data
app_data_dir=$root_dir/cloudengine/appdata
#check dir
cd $root_dir
test ! -d cloudengine && mkdir cloudengine
cd cloudengine
test ! -d data && mkdir data
test ! -d appdata && mkdir appdata

nohup mongod --bind_ip=127.0.0.1 --auth --dbpath=$data_dir --fork --logpath=$data_dir/mongodb.log --pidfilepath=$data_dir/mongodb.pid &

nohup mongod --auth --bind_ip=127.0.0.1 --port=20088 --fork  --dbpath=$app_data_dir/mongodb  --logpath=$app_data_dir/mongodb.log --pidfilepath=$app_data_dir/mongodb.pid &