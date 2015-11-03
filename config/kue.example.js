module.exports = {
  prefix: 'q',
  redis: {
    port: 6379,
    host: '127.0.0.1',
    // auth: 'password',
    db: 13, // if provided select a non-default redis db
    options: {
      // see https://github.com/mranney/node_redis#rediscreateclient
    }
  }
}