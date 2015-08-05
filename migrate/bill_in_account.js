#!/usr/bin/env node

// 完成发货单，并生成对应账单
require('../db.js');
 
var Test = require('../app/models/user');

Test.find({}, function(err,docs){
  console.dir(docs);
  process.exit();
});