var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var multer = require('multer');

var routes = require('./routes/index');
var settings = require('./settings');
var flash = require('connect-flash');
var users = require('./routes/users');
var fs = require('fs');
var accessLog = fs.createWriteStream('access.log', {flags:'a'});
var errorLog = fs.createWriteStream('error.log', {flags: 'a'});
var passport = require('passport'),
    GithubStrategy = require('passport-github').Strategy;

var app = express(); //生成一个express实例app

// view engine setup
app.set('views', path.join(__dirname, 'views')); //设置views文件夹为存放视图文件的目录，存放模板文件，__dirname全局变量，存放当前正在执行的脚本所在的目录
app.set('view engine', 'ejs'); //设置视图模板引擎为ejs
app.use(flash());
app.use(multer({
    dest:'./public/images/',    //上传文件所在的目录
    rename: function(fieldname, filename) {     //修改上传后的文件名
        return filename;
    }
}));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev')); //加载日志中间件
app.use(logger({stream: accessLog}));
app.use(bodyParser.json()); //加载解析json的中间件
app.use(bodyParser.urlencoded({
    extended: false
})); //加载解析urlencoded请求体的中间件
app.use(cookieParser()); //加载解析cookie的中间件
app.use(express.static(path.join(__dirname, 'public'))); //设置public文件夹为存放静态文件的目录
app.use(function (err, req, res, next) {
    var meta = '[' + new Date() + ']' + req.url + '\n';
    errorLog.write(meta + err.stack + '\n');
    next();
});
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: settings.cookieSecret,
    key: settings.db,//cookie name
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
    store: new MongoStore({
        db: settings.db,
        host: settings.host,
        port: settings.port
    })
}));
app.use(passport.initialize());//初始化Passport


/*app.use('/', routes); //路由控制
 app.use('/users', users); */
routes(app);

// catch 404 and forward to error handler 捕捉404c错误并转发到错误处理器
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

passport.use(new GithubStrategy({
    clientID: "d5e82f4a96f4f5450c04",
    clientSecret: "95cccced46041c289256169d05bb01ff8516839a",
    callbackURL: "http://localhost:3000/login/github/callback"
}, function (accessToken, refreshToken, profile, done) {
    done(null, profile);
}));

// error handlers

// development error handler  开发环境下的错误处理器
// will print stacktrace  将错误信息渲染error模板并显示到浏览器里
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler   生产环境下的错误处理器，将错误信息渲染error模板并显示到浏览器中
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app; //导出app实例供其他模块调用
