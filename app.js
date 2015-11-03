require('./init')
require('./db')

var log4js        = require('log4js');
var express       = require('express');
var path          = require('path');
var favicon       = require('serve-favicon');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var res_api       = require('res.api');
var mount         = require('mount-routes');
var log           = log4js.getLogger("moa-api");

var app = express();

var $queues = require('mount-queues')(__dirname);
console.log($queues);

app.use(res_api);

// jsonp callback setup
app.set('jsonp callback name', 'callback');

// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// replace morgan with the log4js connect-logger
log4js.configure('config/log4js.json', { reloadSecs: 300 });
app.use(log4js.connectLogger(log4js.getLogger("http"), { level: 'auto' }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
 
// simple
mount(app, __dirname + '/app/routes');


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
