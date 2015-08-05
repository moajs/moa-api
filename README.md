# Moa-api

技术栈

- express
- mongoose
- bluebird
- res.api

## Features

- 自动加载路由
- 支持mongodb配置
- 使用jsonwebtoken做用户鉴权
- 支持migrate测试
- 支持mocha测试
- 默认集成res.api，便于写接口
- 集成supervisor，代码变动，自动重载
- gulp自动监控文件变动，跑测试
- gulp routes生成路由说明

## 开发流程

- 确定models内容，如果是已有库或已有模型，可以直接使用
- 编写接口文档
- 通过migrate来测试model里的方法（如果测试熟悉，可以直接写测试）
- 通过supertest来测试接口（R层）是否合法
- 通过mocha测试其他业务代码（C层、S层、M层）

## RCSM分层思想

### R = routes

路由层，和express的一样，唯一不一样的是只要是在app/routes下面的js都会自动挂载到路由上。

比如app/routes/user.js,它的访问地址是

http://127.0.0.1:3000/user

比如app/routes/api/user.js,它的访问地址是

http://127.0.0.1:3000/api/user

然后路由里面的子地址，参照express路由写法即可。

典型用法是

```
var express = require('express');
var router = express.Router();

var $ = require('mount-controllers')(__dirname).users_controller;

/* GET users listing. */
router.get('/login', $.api.login);

router.get('/register', function(req, res, next) {
  return res.api(200,{
  	a:'register'
  });
});

module.exports = router;
```

从使用上来说，`router.get('/login', $.api.login);`这个是最合理最常用的的。

但如果是逻辑非常简单的路由，随便写写也无妨

### C = controllers

控制层，主要是负责接口处理结果如何返回，异常如何处理等逻辑控制，不处理具体逻辑

```
var users_service = require('mount-services')(__dirname).users_service;

// -- custom api
exports.api = {
  login: function (req, res, next) {
    // var user_id = req.api_user._id;
    
    var is_valid = users_service.login_valid('sang', '000000');
    
    if(is_valid == true){
      return res.api(200,{
      	a:'login true'
      });
    }else{
      return res.api(200,{
      	a:'login false '
      });
    }
  }
}
```

说明：控制层的代码只会在R层里用到

### S = services

业务逻辑层，通常业务比较负责才会用到业务逻辑层的，如果是单表能处理的，就没有必要使用services层了，所以S层通常是多个models操作的业务逻辑，为了逻辑清晰，以及防止C层膨胀，和耦合，S层很多时候是必要的。

说明：S层只会出现在C层代码里，是对多个models操作的封装。

### M = models

模型层，也就是我们常说的dao层，即data access object，这里采用mongoose + mongoosedao完成model层建模

说明：M层可能出现在S层或C层，不允许出现在其他位置


## auth权限

    curl -d "username=sang&password=000000" http://127.0.0.1:3000/api/auth

获取token作为以后的api授权凭证

获取请求api接口，可以通过header或参数授权

    //检查post的信息或者url查询参数或者头信息
    var token = req.body.token || req.query.token || req.headers['x-access-token'];


示例

```
var express = require('express');
var router = express.Router();

var $middlewares  = require('mount-middlewares')(__dirname);

var $ = require('mount-controllers')(__dirname).users_controller;

/* GET users listing. */
router.get('/login', $middlewares.check_api_token, $.api.login);

module.exports = router;
```

### 测试获取用户信息接口

    curl http://127.0.0.1:3000/api/user/show?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NTc1OGMyNDhkZDEyMzFmN2FhOTY1ZjMiLCJ1c2VybmFtZSI6InNhbmciLCJwYXNzd29yZCI6IjAwMDAwMCIsImF2YXRhciI6IjExMTExIiwicGhvbmVfbnVtYmVyIjoiIiwiYWRkcmVzcyI6IiIsIl9fdiI6MH0.sqxnKY1ay0NbuRtqzFmDQRH49fFnc_R86GdMsrie6F4

返回结果

```
// 20150615195329
// http://127.0.0.1:3000/api/user/show?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NTc1OGMyNDhkZDEyMzFmN2FhOTY1ZjMiLCJ1c2VybmFtZSI6InNhbmciLCJwYXNzd29yZCI6IjAwMDAwMCIsImF2YXRhciI6IjExMTExIiwicGhvbmVfbnVtYmVyIjoiIiwiYWRkcmVzcyI6IiIsIl9fdiI6MH0.sqxnKY1ay0NbuRtqzFmDQRH49fFnc_R86GdMsrie6F4

{
  "data": {
    "user": {
      "_id": "55758c248dd1231f7aa965f3",
      "username": "sang",
      "password": "000000",
      "avatar": "11111",
      "phone_number": "",
      "address": "",
      "__v": 0
    }
  },
  "status": {
    "code": 0,
    "msg": "success"
  }
}
```


## task


### list api routes

    gulp routes
    
### test

    gulp
    
或者下面这样也行

    ➜  moa-api  mocha test/controller
    提醒:debug状态连接数据库:
    mount routes_folder_path = /Users/sang/workspace/github/moa-api/app/routes


      GET /users
    [mongoose log] Successfully connected to:  NaN
    mongoose open success
    set api header
    GET /api/user/login 200 4.529 ms - 40
        ✓ respond with json


      1 passing (33ms)
