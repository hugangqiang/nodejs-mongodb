const path = require('path');
//加载express模块
const express = require('express');

//加载数据库模块
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
//创建app应用
const app = express();

app.use( bodyParser.urlencoded({extended: true}) );
app.use(bodyParser.json());

app.use('/oa',require('./routers/oa'));

//连接数据库
mongoose.connect('mongodb://hgq:hgq1024@139.224.118.0:27017/oa',{useMongoClient: true},function( err ){
    if( err ){
        console.log('数据库连接失败');
    }else{
        console.log('数据库连接成功');
        //监听http请求8080端口
        app.listen(1112);
    }
});
