var msgpack = require('msgpack5')();

module.exports = function  (req, res, next) {
  res._json = res.json;

  res.json = function (obj) {
    if (!this.get('Content-Type')) this.set('Content-Type', 'application/x-msgpack');
    res.send(msgpack.encode(obj));
  };

  next();
};
