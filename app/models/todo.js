/**
 * Created by alfred on July 1st 2015, 11:52:49 pm.
 */

var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;
var MongooseDao = require('mongoosedao');

var todoSchema = new Schema(
    {"todoname":"String","password":"String","avatar":"String","phone_number":"String","address":"String"}
);

todoSchema.methods.is_exist = function(cb) {
  var query;
  query = {
    todoname: this.todoname,
    password: this.password
  };
  return this.model('todo').findOne(query, cb);
};

var todo = mongoose.model('todo', todoSchema);
var todoDao = new MongooseDao(todo);
 
module.exports = todoDao;