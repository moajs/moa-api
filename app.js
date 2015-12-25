require('./init')
require('./db')

var log4js        = require('log4js'); 
var res_api       = require('res.api');
var log           = log4js.getLogger("moa-api");

var app = require('base2')({
  // debug: true,
  root:__dirname,
  "pre": function(app) {
    app.use(res_api);
  },
  "views": "app/views",
  "routes": "app/routes",
  "public": "public"
})

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
  res.api_error_code = 404;
  return res.api_error({
    message: 'Not Found'
  });
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  res.api_error_code = err.status || 500;
  return res.api_error({
    message: err.message,
    error: err
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.api_error_code = err.status || 500;
  return res.api_error({
    message: err.message,
    error: {}
  });
});

module.exports = app;
