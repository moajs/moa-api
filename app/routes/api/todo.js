var express = require('express');
var router  = express.Router();
var log     = require('log4js').getLogger("api/todo");

var $middlewares  = require('mount-middlewares')(__dirname);

var $ = require('mount-controllers')(__dirname).todos_controller;

/* GET users listing. */
// router.get('/login', $middlewares.check_api_token, $.api.login);

router.get('/register', function(req, res, next) {
  return res.api(200,{
  	a:'register'
  });
});

router.get('/:user_id', $middlewares.check_api_token, $.api.show);

module.exports = router;
