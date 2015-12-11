require('./init')
require('./db')

var log4js        = require('log4js'); 
var res_api       = require('res.api');
var log           = log4js.getLogger("moa-api");

var app = require('base2')({
  // debug: true,
  root:__dirname,
  "views": "app/views",
  "routes": "app/routes",
  "public": "public",
})

app.use(res_api);

// use msgpack to serialize json
if (process.env.SERIALIZE === 'msgpack') {
  app.use(require('./app/middlewares/msgpack_json'));
}

// jsonp callback setup
app.set('jsonp callback name', 'callback');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// replace morgan with the log4js connect-logger
log4js.configure('config/log4js.json', { reloadSecs: 300 });
app.use(log4js.connectLogger(log4js.getLogger('http'), { level: 'auto' }));

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
