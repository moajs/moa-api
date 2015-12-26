# Moajs框架演进之路

大部分框架的演进之路大体都是一样的

- 实现（土方法）
- 实践（项目实操）
- 看齐最佳实践
- 不断封装、造轮子
- 走出自己的特色

下面简单的介绍一下moajs的演进之路

## 什么是Moajs？

moajs是我司开发的开源nodejs web框架。

https://github.com/moajs

目前主要

- moa-api
- moa-frontend
- moa-h5
- mongoosedao
- res.api
- mount-routes

moa是作为名词是恐鸟（一种新西兰无翼大鸟，现已灭绝） https://en.wikipedia.org/wiki/Moa

![](https://raw.githubusercontent.com/moajs/moa/dev/doc/moa.jpg)

## 阶段0：原始的Expressjs

最开始的时候都是使用express-generator生成的项目骨架

```
➜  test  express express-test

   create : express-test
   create : express-test/package.json
   create : express-test/app.js
   create : express-test/public
   create : express-test/public/javascripts
   create : express-test/views
   create : express-test/views/index.jade
   create : express-test/views/layout.jade
   create : express-test/views/error.jade
   create : express-test/public/stylesheets
   create : express-test/public/stylesheets/style.css
   create : express-test/routes
   create : express-test/routes/index.js
   create : express-test/routes/users.js
   create : express-test/public/images
   create : express-test/bin
   create : express-test/bin/www

   install dependencies:
     $ cd express-test && npm install

   run the app:
     $ DEBUG=express-test:* npm start

➜  test  cd express-test 
➜  express-test  tree . -L 1 -d
.
├── bin
├── public
├── routes
└── views

4 directories

```

express是遵循小而美的原则，所以只有routes和views层，不足以在项目里使用的。

## 阶段1：抽象config和controller、model、middleware等

```
$ tree . -L 1 -d
.
├── actions
├── config
├── cron_later
├── doc
├── middleware
├── migrate
├── models
├── node_modules
├── public
├── queues
├── routes
├── test
├── tmp
├── uploads
└── views
```
说明

- 继承express-generator的结构（routes和views）
- actions即controller控制器层
- models即模型层
- config是配置项目录
- middleware中间件层
- migrate是我们处理数据的，跟rails的migrate不完全一样
- test是测试目录
- queues是队列
- cron_later是调度
- doc文档
- uploads是上传自动创建的目录

这阶段仅仅是用，算是基于express抽象了一点业务、配置相关的东西而已，目录多了依然蛋疼


## 阶段2：向rails看齐


### 目录结构

```
➜  moa-api git:(master) ✗ tree . -L 2 -d
.
├── app
│   ├── controllers
│   ├── middlewares
│   ├── models
│   ├── routes
│   ├── services
│   └── views
├── bin
├── config
├── doc
├── logs
├── migrate
├── public
└── test
    └── controller

42 directories

```

说明

- 使用app作为代码管理目录，归类可变代码都放到app下面
- 其他沿用【阶段1】的设计

具体看一下app目录下的分类

```
├── app
│   ├── controllers
│   ├── middlewares
│   ├── models
│   ├── routes
│   ├── services
│   └── views
```

说明

- mvc和rails的都一样
- middlewares是express的概念，放这里比较合适，如果像rails一样设置plugin也可以考虑，不如放到此处更容易理解
- services层实际是java里面喜欢用的概念，多个模型dao的操作，看成是一个业务，所以复杂业务场景下，services层有它的好处

### 你看不到的优化

- 使用mongoosedao把mongoose的crud、分页等封装了dao操作
- 使用mount-routes自动挂载路由，让你只关系路由内容，而不必关系url地址，这样也算coc的一种（约定大于配置）
- 使用res.api约定api返回数据


至此，moajs的0.x版本，特性已经足够了。

其实moajs还提供脚手架scaffold和插件机制

### 脚手架scaffold

```
moag order product_name:string product_count:string all_price:string status:string delivery_num:string pay_num:string activity_id:string  owner_id:string contact_id:string
```

生成目录如下

```
➜  moa-scaffold  tree .
.
└── app
    ├── controllers
    │   └── orders_controller.js
    ├── models
    │   └── order.js
    ├── routes
    │   ├── api
    │   │   └── orders.js
    │   └── orders.js
    └── views
        └── orders
            ├── edit.jade
            ├── index.jade
            ├── new.jade
            ├── order.jade
            └── show.jade

7 directories, 9 files
```

这个生成器的原理是我们参考rails的脚手架，代码结构，mvc都非常方便

需要说明的是

- 先有结构
- 然后才有脚手架

### 插件机制

大家都知道express基于connect，有middleware中间件的概念，它本身遵循小而美的设计哲学，导致它非常精简

从express@generator来看，它就只能做点小打小闹的东西，如果要设计一个复杂的大系统，就免不了和代码结构，模块，组件等战斗

从我的角度讲，这些东西都可以理解成是业务插件，比如对于一个框架来说，用户管理就应该像ruby里的devise一样，以一个gem的形式存在，如果代码里引用，调用就好了。

gem + rails plugin机制可以做，那么express + npm也是可以的，但是我们缺少的plugin机制，先说利用npm的回调实现它的可能性

比如在一个boilerplate项目里，我们安装插件

    npm install --save moa-plugin-user

安装完成之后，我们需要对项目里的文件或配置也好做一个插件登记，这些东西是否可以放到postinstall里呢？

剩下的就都是nodejs代码了，大家写就好了。

moajs里0.x版本使用软连接创建插件

- nmm用于插件管理和初始化
- 使用npm的postinstall hook完成安装工作
- 使用软连接的方式创建插件（简单粗暴法）

这其实有很多痛苦，每次升级插件都需要在主库里更新，以后还是要放到目录里，按照php的做法走。

### 总结

总结一下moajs的特性

- 配置化
- 目录和rails类似
- 脚手架scaffold
- 插件机制
- 一些我们总结的最佳实践

具体

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

## 阶段3：走自己的路

上一个阶段【阶段2：向rails看齐】其实还是基于express的最佳实践而已。代码里处处都是express的影子，所以moajs 0.x版本真的只是基于express的最佳实践。

但是技术的演进步伐非常快

- es6和7来了
- async/generator也来了
- koa来了
- typescript来了
- ...

这些对我们来说都是要思考的

### 前后端分离

- 前端：[moa-frontend](https://github.com/moajs/moa-frontend) 和 [moa-h5](https://github.com/moajs/moa-h5)
  - public下面的采用nginx做反向代理
  - 其他的采用express+jade精简代码（ajax与后端交互）
- 后端：[moa-api](https://github.com/moajs/moa-api)

### 微内核base2

之前使用express，各种配置都在app.js里，恶心的要死，而且没有app的生命周期管控

于是写了base2，它是一个高度可配置的带有应用生命周期管控的 nodejs web 微框架（同时支持express和koa）

https://github.com/base-n/base2-core 

Usages

```
var app = require('base2')({
  // debug: true,
  root:__dirname,
  "views": "views",
  "routes": "routes2",
  "public": "public",
})

app.start(3019);
```

- 如果有views目录就可以显示视图
- 如果有routes目录，就可以自动挂载路由
- 如果有public就有静态server，目录随便指就好了

简单吧，下面讲讲为啥这样设计。

我们对项目的认知

- framework（框架选项）
  - express
  - koa
- env（环境，参考rails的环境说明）
  - production
  - development
  - test
- type（类型，我们对项目分类，有的是带视图的，有的是api的，有的rpc服务的，all即所有）
  - normal
  - api
  - all
  - service

这些其实对express和koa的中间件分类的维度。也就是说不同场景，我们加载不通的中间价。

那么我们什么时候加载呢？你想可配置，可高度配置，你就一定得留出足够的点，让之前可以完成功能也能很好的集成进来。

于是引出app的生命周期，我们可以反思一下app.js里都做了什么？

- 设置
- 全局中间件
- 路由

其他都指出去了。

那么我们就可以抽象一下了

- config.pre
- settings
  - config.before_settings
  - config.after_settings
- global_middlewares
  - config.before_global_middlewares
  - config.after_global_middlewares
- routes
  - config.before_routes
  - config.after_routes
- config.post

实际上也是之前app做的事儿，但是要放到配置项里，按需采用。

举个例子,moa-api里的app.js
改写后

```
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
```

res_api是一个中间件，如果想在路由里直接使用res.api方法，就必须先挂载。

这里选了pre这个最早执行的生命周期方法。其实也可以routes前面的所有生命周期都可以。

### 兼容koa和express

噱头而已，其实兼容与否并不重要，base2给我们提供了这种可能，我们用就好了

通过`koa-generator`大家可以体验一下koa1和koa2的写法和express的差别。

另外我组织了大家《一起学koa》 

http://base-n.github.io/koa-generator-examples 

欢迎参与

## Next

moajs在设计、实践上都是不错的，不过目前还不够完善，希望大家可以多多参与

下一步还在做

- 模型管控，dao层剥离，防止模型乱create和update
- 面向微服务
- 私有npm库和本地npm库实践
- 容器化、自动化（蔡神的https://github.com/fundon/fundon.github.io/issues/19）

未来路还很远。。。但很美好