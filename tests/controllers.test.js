var assert = require('assert');
var expect = require("expect.js");
var Promise = require("bluebird");
var config = require('../config');
var jwt = require('jwt-simple');
var errors = require('../helpers/errors');
var supertest = require('supertest');

var app = require('../server.js').app;

describe('/api/session',function(){
    it('POST; respond with json && response == token', function(done){
        supertest(app)
            .post('/api/session')
            .send({"username":"test","password":"password"})
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err, res){
                if(err) throw err;
                expect(res.body).to.have.property('token');
                done();
            })
    })

    it('PUT; respond with error', function(done){
        supertest(app)
            .put('/api/session')
            .send({"username":"test","password":"password"})
            .expect(404)
            .end(function(err, res){
                if(err) throw err;
                done();
            })
    })

})

describe('/api/users', function(){
    it('GET; respond with users', function(done){
        supertest(app)
            .get('/api/users')
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                if(err) throw err;
                expect(res.body).to.have.property('meta');
                done();
            })
    })

    it('POST; respond with user', function(done){
        supertest(app)
            .post('/api/users')
            .send({"username":"usertestlr13","password":"12345678","cash":1000000})
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err, res){
                if(err) throw err;
                expect(res.body).to.have.property('username');
                done();
            })
    })

    it('DELETE; respond with error', function(done){
        supertest(app)
            .delete('/api/users')
            .expect(404)
            .end(function(err, res){
                if(err) throw err;
                done();
            })
    })
})

describe('/api/domains', function(){
    it('GET; respond with domains', function(done){
        supertest(app)
            .get('/api/domains')
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err, res){
                if(err) throw err;
                expect(res.body).to.have.property('meta');
                done();
            });
    })

    it('POST; respond with domain', function(done){
        supertest(app)
            .post('/api/domains')
            .send({"domain":"helloisverycreative.com","price":50000})
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err, res){
                if(err) throw err;
                expect(res.body).to.have.property('domain');
                done();
            })
    })

    it('POST; ../5; должен вернуться 404', function(done){
        supertest(app)
            .post('/api/domains/5')
            .send({})
            .expect(404)
            .end(function(err, res){
                if(err) throw err;
                done();
            });
    })

    it('DELETE; respond with error', function(done){
        supertest(app)
            .delete('/api/domains')
            .send({})
            .expect(404)
            .end(function(err, res){
                if(err) throw err;
                done();
            })
    })

})