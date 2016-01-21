var mongodb = require('./db');
var crypto = require('crypto');

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}

module.exports = User;

//储存用户信息
User.prototype.save = function (callback) {
    //要存入数据库的用户文档
    var md5 = crypto.createHash('md5'),
        email_MD5 = md5.update(this.email.toLowerCase()).digest('hex'), //将email转换成小写再编码
        head = "https://www.gravatar.com/avatar/" + email_MD5 + "?s=48";
    var user = {
        name: this.name,
        password: this.password,
        email: this.email,
        head: head
    };

    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err); //错误返回err信息
        }
        //读取users集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);	//如果错误返回err
            }
            //将用户的数据插入Users集合
            collection.insert(user, {
                safe: true
            }, function (err, user) {
                mongodb.close();
                if (err) {
                    return callback(err); //如果错误返回err
                }
                callback(null, user[0]); //成功，err为null,并返回存储后的用户文档
            });
        });
    });

};

//读取用户信息
User.get = function (name, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);	//如果错误返回err
        }
        //读取users集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);	//如果错误，返回err
            }
            //查找用户名name值为name的一个文档
            collection.findOne({
                name: name
            }, function (err, user) {
                mongodb.close();
                if (err) {
                    return callback(err);	//如果错误返回err
                }
                callback(null, user);	//成功，返回查询的用户信息
            });
        });
    });
};