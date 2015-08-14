var express = require('express');
var router  = express.Router();
var log     = require('log4js').getLogger("api/index");

var User = require('../../models/user');

var jwt = require('jsonwebtoken');//用来创建和确认用户信息摘要

var $middlewares = require('mount-middlewares')(__dirname);
// log.info($middlewares);

router.get('/', function(req, res, next) {
  res.json({
    a:1
  });
});

// auth
router.post('/auth', function(req, res, next) {
  log.info(req.body);
  
  User.one({username: req.body.username},function(err, user){
    if (err) throw err;
    log.info(user);

    if (!user) {
        res.json({ success: false, message: '认证失败，用户名找不到' });
    } else if (user) {

      // 检查密码
      if (user.password != req.body.password) {
          res.json({ success: false, message: '认证失败，密码错误' });
      } else {
        // 创建token
        var token = jwt.sign(user, 'app.get(superSecret)', {
            'expiresInMinutes': 1440 // 设置过期时间
        });

        // json格式返回token
        res.json({
            success: true,
            message: 'Enjoy your token!',
            token: token
        });
      }
    }
  });
});


module.exports = router;
