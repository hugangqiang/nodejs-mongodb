const mongoose = require('mongoose');

//用户的表结构
module.exports = new mongoose.Schema({
    //用户名
    userName: String,
    password: String,
    userPhone: String,
    userEmail: String,
    userClass: {
        type: String,
        default: 'staff'
    },
    sex: String,
    job: String,
    idCard: String,
    photo: String,
    education: {
        type: String,
        default: '高中'
    },
    school: {
        type: String,
        default: '无'
    },
    img: {
        type: String,
        default: '/updata/img/default.png'
    }
});