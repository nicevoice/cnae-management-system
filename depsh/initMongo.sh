#! /bin/zsh
#must set your own database and user info
db_name='naeweb'  #nae-web's db
db_user='db_user' #nae-web's db user
db_pass='db_pass' #nae-web's db password
db_app_port=20088 #app db port
db_app_user='db_app_user' #app db user
db_app_pass='db_app_pass' #app db password

echo "db.addUser('$db_user', '$db_pass')\n use $db_name\n db.addUser('$db_user', '$db_pass')" | mongo 127.0.0.1/admin

echo "db.addUser('$db_app_user', 'db_app_pass')" | mongo 127.0.0.1:20088/admin
