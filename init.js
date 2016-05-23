var fs = require('fs')
  , log4js = require('log4js')
  , log_path = 'logs'
  , is_exist = fs.existsSync(log_path)
  , log = log4js.getLogger("moa-api");

/**
 * 创建log目录
 */ 
function _create_log_dir(log_path){
  var is_exist = fs.existsSync(log_path);
  
  if (is_exist !== true) {
    console.log('log_path is not exist, create folder:' + log_path);
    fs.mkdirSync(log_path, 0755);
  } else {
    console.log('log_path is exist, no operation!');
  }
}

function main(){
  _create_log_dir(log_path);
}

// 程序入口
main();