# TaoJob Web System base on [Nodejs](http://nodejs.org).

## Requires:
 * use node version:0.5.2, mongoDB version:1.4.4
 * Node_modules
 * [express](http://expressjs.com), web application.
 * [ejs](https://github.com/visionmedia/ejs), html template engine.
 * [node-mongoskin](https://github.com/guileen/node-mongoskin), db client to connect the mongoskin.
 * [connect-form](https://github.com/visionmedia/connect-form), handle file uploading.
 * [nodemailer](https://github.com/andris9/Nodemailer.git), send email.
 * [eventproxy.js](https://github.com/shyvo1987/eventproxy.js), Far away deep callback.

    $ npm install express ejs mongoskin nodemailer EventProxy.js connect-form
    

##  
    
 
## Start Web Script:
    
    node server.js

## 完成功能
 * 用户登录注册。管理用户信息。
 * 创建、删除、管理应用信息。（汇总信息、应用设置、成员管理、代码管理、管理记录已实现，其他未实现）
 * 邮件邀请其他用户协助开发，有权限控制。
 * 上传应用代码（gz/tar格式打包上传）。
 * 发送反馈信息。

## 配置信息
 * 邮件发送使用google的SMTP服务，暂时用的heyiyu.deadhorse@gmail.com发送，可以在config.js内修改。邀请函的模板在mailTemplate.html中。
 * 反馈信息暂时发送到dead_horse@qq.com，可在config.js内修改。
 * 代码上传放置在/apps/文件夹下，可以在config.js中修改uploadDir。
 * 

 
## TODO:
 * 开启、停止应用
 * 通知模块
 * 注册邀请码功能
 * log日志有问题
