
const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs');
const multer  = require('multer');
//数据表
const User = require('../models/User');
const Bg = require('../models/Bg');
//加密
const md5 = require('md5');
const jwt = require('jsonwebtoken');
//统一返回格式
let responseData;
//设置跨域访问
router.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
router.use( function(req, res, next){
    responseData = {
        code: 0,
        message: '',
        token: ''
    };
    next();
});



//用户注册
router.post('/user/register',function(req,res,next){

    let user = req.body;
    delete user.passwordCheck;
    user.password = md5(user.password);

    User.findOne({
        userName: user.userName
    }).then(function ( userInfo ) {
        if( userInfo ){
            //userInfo不为null表示数据库中又该记录
            responseData.code = 4;
            responseData.message = '用户名已经被注册了';
            res.json( responseData );
            return;
        }

        //保存用户注册的信息到数据库中
        return new User({
            userName: user.userName,
            password: user.password
        }).save();
    }).then(function( newUserInfo ){
        responseData.message = '注册成功';
        res.json( responseData );
        return;
    });
});
//用户登录
router.post('/user/login',function(req,res,next){
    let user = req.body;
    user.password = md5(user.password);
    //秘钥
    let jwtTokenSecret= 'gangqiang';
    //生成token
    let token = jwt.sign(user, jwtTokenSecret, {
        expiresIn: 3600 // 设置过期时间,单位是秒
    });

    //数据验证
    User.findOne({
        userName: user.userName,
        password: user.password
    }).then(function ( userInfo ) {
        if( !userInfo ){
            responseData.code = 2;
            responseData.message = '用户名或密码错误';
            res.json( responseData );
            return;
        }
        //用户名和密码正确的
        responseData.message = '登录成功';
        responseData.token = token;

        res.json( responseData );
        return;
    })
});
//获取背景
router.get('/bgUrl',function(req,res,next){
    Bg.find().then(function(url){
        res.json(url);
        return;
    })
});
//图片上传
let createFolder = function(folder){
    try{
        fs.accessSync(folder);
    }catch(e){
        fs.mkdirSync(folder);
    }
};
let uploadFolder = './upload/img';
createFolder(uploadFolder);
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);    // 保存的路径，备注：需要自己创建
    },
    filename: function (req, file, cb) {
        // 将保存文件名设置为 字段名+时间轴
        cb(null,  Date.now() + file.originalname);
    }
});
// 通过 storage 选项来对 上传行为 进行定制化
let upload = multer({ storage: storage }).any();
router.get('/download',function(req,res){
    let pathname = req.query.url;
    let realPath = "upload/img/" + pathname;
    fs.exists(realPath, function (exists) {
        if (!exists) {
            res.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            res.write("This request URL " + pathname + " was not found on this server.");
            res.end();
        } else {
            fs.readFile(realPath, "binary", function (err, file) {
                if (err) {
                    res.writeHead(500, {
                        'Content-Type': 'text/plain'
                    });
                    res.end(err);
                } else {
                    res.writeHead(200, {
                        'Content-Type': 'text/html'
                    });
                    res.write(file, "binary");
                    res.end();
                }
            });
        }
    });
});
router.post('/upload',function(req,res){
    upload(req, res, function (err) {
        //添加错误处理
        if (err) {
            responseData.code = 2;
            responseData.message = '上传错误';
            res.json( responseData );
            return;
        }
        req.file = req.files[0];
        let tmp_path = req.file.path;
        let src = fs.createReadStream(tmp_path);
        new Bg({
            url: req.file.filename
        }).save().then(function(data){
            responseData.message = '上传成功';
            res.json( responseData );
            res.end();
        });
    });
});

//验证
router.use( function(req, res, next){
    let token = req.body.token;
    // 解析 token
    if (token) {
        // 确认token
        jwt.verify(token, 'gangqiang', function(err, decoded) {
            if (err) {
                res.json({ success: false, message: 'token信息错误' });
                return;
            } else {
                // 如果没问题就把解码后的信息保存到请求中，供后面的路由使用
                User.findOne({
                    userName: decoded.userName
                }).then(function ( userInfo ) {
                    if(userInfo){
                        delete userInfo.password;
                        req.userinfo = userInfo;
                        res.json({success: true,userInfo:userInfo});
                        return;
                    }else{
                        res.json({ success: false, message: '不存在用户' });
                        return;
                    }
                });
            }
        });
    } else {
        // 如果没有token，则返回错误
        res.json({ success: false, message: '没有token信息' });
        return;
    }
});

module.exports = router;