# Moa-api

技术栈

- [base2(mirco kernel)](https://github.com/base-n/base2-core)
- [mongoose](https://github.com/Automattic/mongoose)
- [bluebird](https://github.com/petkaantonov/bluebird)
- [res.api](https://github.com/moajs/res.api)

## 前后端分离实践

- 前端：[moa-frontend](https://github.com/moajs/moa-frontend) 和 [moa-h5](https://github.com/moajs/moa-h5)
  - public下面的采用nginx做反向代理
  - 其他的采用express+jade精简代码（ajax与后端交互）
- 后端：[moa-api](https://github.com/moajs/moa-api)

## Features

- 自动加载路由
- 支持mongodb配置
- 集成mongoosedao，快速写crud等dao接口
- 自带用户管理
- 使用jsonwebtoken做用户鉴权
- 支持migrate测试
- 支持mocha测试
- 默认集成res.api，便于写接口
- 集成supervisor，代码变动，自动重载
- gulp自动监控文件变动，跑测试
- gulp routes生成路由说明
- 使用log4js记录日志
- 集成kue队列[需要使用mount-queues插件]
## Starter

前置条件，保证以下服务可以正常访问

- mongodb

具体操作如下

```
git clone --depth=1 https://github.com/moajs/moa-api.git api

cd api
npm install
export MOA_PORT=3040 && npm start
```

访问地址即可

http://127.0.0.1:3040/api

## 开发流程

- 确定models内容，如果是已有库或已有模型，可以直接使用
- 编写接口文档
- 通过migrate来测试model里的方法（如果测试熟悉，可以直接写测试）
- 通过supertest来测试接口（R层）是否合法
- 通过mocha测试其他业务代码（C层、S层、M层）

## 扩展

- 集成zeromq（https://github.com/i5ting/mqpush）

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

### 用户管理

http://127.0.0.1:3000/users

### 鉴权接口


获取token作为以后的api授权凭证

获取请求api接口，可以通过header或参数授权

    //检查post的信息或者url查询参数或者头信息
    var token = req.body.token || req.query.token || req.headers['x-access-token'];


下面给出参数的测试方式

```
➜  moa-api git:(master) ✗ curl -d "username=sang&password=000000" http://127.0.0.1:3000/api/auth
{"success":true,"message":"Enjoy your token!","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NWMxOWZkZTNkYWMxZGViMDhjNDM4ODkiLCJ1c2VybmFtZSI6InNhbmciLCJwYXNzd29yZCI6IjAwMDAwMCIsImF2YXRhciI6IiIsInBob25lX251bWJlciI6IiIsImFkZHJlc3MiOiIiLCJfX3YiOjB9.ocfeQ_Kx00edNfbwDtpTrxXxotfOAo2a_zni9Ujsxwg"}%                                                       
```

即

```
token = eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NWMxOWZkZTNkYWMxZGViMDhjNDM4ODkiLCJ1c2VybmFtZSI6InNhbmciLCJwYXNzd29yZCI6IjAwMDAwMCIsImF2YXRhciI6IiIsInBob25lX251bWJlciI6IiIsImFkZHJlc3MiOiIiLCJfX3YiOjB9.ocfeQ_Kx00edNfbwDtpTrxXxotfOAo2a_zni9Ujsxwg
```

### R层鉴权示例

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

    curl http://127.0.0.1:3000/api/users?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NWMxOWZkZTNkYWMxZGViMDhjNDM4ODkiLCJ1c2VybmFtZSI6InNhbmciLCJwYXNzd29yZCI6IjAwMDAwMCIsImF2YXRhciI6IiIsInBob25lX251bWJlciI6IiIsImFkZHJlc3MiOiIiLCJfX3YiOjB9.ocfeQ_Kx00edNfbwDtpTrxXxotfOAo2a_zni9Ujsxwg

返回结果

```
// 20150805133902
// http://127.0.0.1:3000/api/users?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NWMxOWZkZTNkYWMxZGViMDhjNDM4ODkiLCJ1c2VybmFtZSI6InNhbmciLCJwYXNzd29yZCI6IjAwMDAwMCIsImF2YXRhciI6IiIsInBob25lX251bWJlciI6IiIsImFkZHJlc3MiOiIiLCJfX3YiOjB9.ocfeQ_Kx00edNfbwDtpTrxXxotfOAo2a_zni9Ujsxwg

{
  "data": {
    "users": [
      {
        "_id": "55c19fd43dac1deb08c43888",
        "username": "12",
        "password": "2",
        "avatar": "23",
        "phone_number": "23",
        "address": "",
        "__v": 0
      },
      {
        "_id": "55c19fde3dac1deb08c43889",
        "username": "sang",
        "password": "000000",
        "avatar": "",
        "phone_number": "",
        "address": "",
        "__v": 0
      }
    ]
  },
  "status": {
    "code": 0,
    "msg": "request success!"
  }
}
```

## queue用法

详见 https://github.com/moa-modules/moa-plugin-kue

## migrate


当需要确定model里mongoose接口是否正确的时候，可以考虑创建一个migrate

    node migrate/bill_in_account.js 

如果是复杂的业务逻辑放到测试里。

## 使用msgpack序列化json

支持使用msgpack序列化json，客户端也需要对应的进行decode。

目前默认是不开启的。

若要开启，需将process.env.SERIALIZE设为'msgpack'：如SERIALIZE=msgpack node bin/www

## task


### list api routes

    gulp routes
    
![](doc/routes.png)


杀死进程

    gulp kp

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


### more

see http://nodeonly.com/2015/06/14/node-restful-api.html

## Todo

- http://bookshelfjs.org/ 

## Moajs微信用户组

![](doc/wechat.jpg)

如果加不上，请加微信`shiren1118`,说明加入原因

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

## 版本历史

- v1.0.0 使用base2作为微内核，移除之前express用的依赖
- v0.1.2 增加log4js作为日志管理
- v0.1.0 初始化版本，以express为基础，做的express最佳事件

## 欢迎fork和反馈

- write by `i5ting` shiren1118@126.com

如有建议或意见，请在issue提问或邮件

## License

this repo is released under the [MIT
License](http://www.opensource.org/licenses/MIT).
