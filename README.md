# CNAE Management Web System base on [Nodejs](http://nodejs.org). [![Build Status](https://secure.travis-ci.org/dead-horse/cnae-management-system.png)](http://travis-ci.org/dead-horse/cnae-management-system)   
 * 基于connect的网站。结合于node app engine一起，提供一个Node.js的在线应用托管平台。网站地址[NAE](http://cnodejs.net)   
    
## Requires:  
 * node version>0.5, mongoDB version > 1.4.4 redis   
 * connect 1.x(node_module已包含)   
   模块依赖： $ npm install connect-form connect-redis crypto ejs EventProxy.js mongoskin nodemailer redis rimraf    
   
## config.json   
  $ npm -g install jake  
  $ cd src && jake makeconf   
  $ 修改config.json的私钥和密码等信息   
    
## mongoDB && redis   
   # mongodb   
   $ wget http://fastdl.mongodb.org/linux/mongodb-linux-i686-2.0.2.tgz   
   $ tar -xvf mongodb-linux-i686-2.0.2.tgz   
   $ 修改db启动脚本和db初始化脚本并复制到mongodb文件夹，启动数据库，运行初始化脚本（only once）。  

   # redis   
   $ wget http://redis.googlecode.com/files/redis-2.4.4.tar.gz   
   $ tar -xvf redis-2.4.4.tar.gz   
   $ cd redis-2.4.4   
   $ make   
   $ add auth in redis.conf (requirepass password)  
   $ nohup src/redis-serveri redis.conf &   
   
## 功能介绍  
* 每个用户可以创建10个项目，可以参与其他人的项目合作开发。
* 通过子域名绑定，可以通过项目申请到的子域名访问自己的应用。
* 管理应用的上下线状态，查看应用的资源消耗信息。
* 代码部署管理
    * 支持git代码管理。
        * 如果用户选择在个人信息中填入github网站帐号，则可以进行所有git的操作。（推荐）
        * 如果用户未填入github帐号，则只支持git-read-only，无法push同步。
    * 本地上传下载
        * 通过上传代码（gz/zip压缩包）更新服务器代码。
        * 可以选择性下载项目文件夹内容。
    * npm安装模块
        * 在代码管理项里面，可以输入模块名安装模块。
* 提供自带网络编辑器，可以在线编辑代码，无需本地任何环境支持。
* 提供应用日志记录，可以查看应用的日志，同时在线编辑的时候能够实时查看日志。
* 提供mongodb数据库，可以为每个应用申请一个独立的dbs。
    * 用户可以通过分配到的数据库用户名密码在应用中使用数据库。
    * 提供一个简单的shell，进行应用数据库的查询修改。
* 可以通过邮件邀请已注册用户对自己的项目进行共同开发。
* 可以在应用广场上看到所有项目，也可以对感兴趣的项目提交共同开发申请。
* 每个注册用户有5个邀请朋友加入网站的名额。
 
## Start Web Script:
 * bin/start.sh   

## 更新
 * 11.28 更新push功能。在个人中心生成github公钥之后粘贴到github ssh上， 就可以使用push功能。
