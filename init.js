var fs = require('fs')
  , log4js = require('log4js')
  
  
var log_path = 'logs'
  , is_exist = fs.existsSync(log_path)
  , log = log4js.getLogger("moa-api");

if (is_exist !== true) {
  console.log('log_path is not exist, create folder:' + log_path);
  fs.mkdirSync(log_path, 0755);
} else {
  console.log('log_path is exist, no operation!');
}

exports.get_logger = function(){
  log4js.configure('config/log4js.json', { 
    reloadSecs: 300 
  });
  
  return log4js;
};
