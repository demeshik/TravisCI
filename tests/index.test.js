var assert = require('assert');
var expect = require("expect.js");
var Promise = require("bluebird");
var config = require('../config.json');
var jwt = require('jwt-simple');
var errors = require('../helpers/errors');

var SequelizeMock = require('sequelize-mock');
var dbMock = new SequelizeMock();

var userMock = dbMock.define('users',{
    'username':'admin',
    'password':'$2a$10$5bFnMixnsOo/925rC1aalu4JJs7KYOOBqF3LLITqOg4NSww4Gc7EC',
    'cash':1000000
});
var domainMock = dbMock.define('domains',{
    'domain':"demeschhikisverycool.com",
    'isFree':1,
    'price':5000,
    'userId':1
},{
    
});


userMock.hasMany(domainMock);
domainMock.belongsTo(userMock);


var authService = require('./lib/authService.js')(userMock,domainMock,config, errors);


describe("authService", function(){
    describe("login", function() {
    
        it("если недостаточно данных, должна вернуться ошибка", function(done) {
            var auth = {
                username:"testuser"
            };
            authService.login(auth).catch(function (result){
                assert.deepEqual(result, errors.wrongParams);
                done();
            });

        });

        it("если неверный пароль, должна вернуться ошибка",function(done){
            var auth = {
                username:"testuser",
                password:"password"
            };
            authService.login(auth).catch(function (result){
                assert.deepEqual(result, errors.wrongCredentials);
                done();
            });
        })

        it("если все верно - возвращается токен",function(done){
            var auth = {
                username:"admin",
                password:"admin"
            };
            authService.login(auth).then(function (result){
                assert.equal(jwt.encode({username:auth.username}, config.secretKey), result);
                done();
            }).catch(done);
        })

    });

    describe("getInfo", function(){
        
        it("если неверный токен, то вернуть ошибку", function(done){
            var data=[];
            data['x-auth'] = "test";

            authService.getInfo(data).catch(function(result){
                assert.deepEqual(result,errors.nonAuthorized);
                done();
            });
        })

        it("если все в порядке - вернуть пользователя", function(done){
            var data=[];
            data['x-auth'] = jwt.encode({username:"admin"}, config.secretKey);

            authService.getInfo(data).then(function (result){
                expect(result).to.be.an('object');
                expect(result).to.have.property('username');
                expect(result).to.have.property('cash');
                done();
            })
        });
    })
})
