var request = require('supertest');
var assert  = require('chai').assert;
var expect  = require('chai').expect;
require('chai').should();

var app = require('../../app');

describe('GET /users', function(){
  it('respond with json', function(done){
    request(app)
      .get('/api/user/login')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  })
})