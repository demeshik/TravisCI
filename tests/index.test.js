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
var domainService = require('./lib/domainService.js')(domainMock,userMock,errors);
var userService = require('./lib/userService.js')(userMock,domainMock,errors);


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

describe("domainService", function(){

    describe("localcheck", function(){
        it("должен вернуться домен", function(done){
            domainService.localCheck("demeschhikisverycool.com").then(function(result){
                expect(result).to.be.an('object');
                expect(result).to.have.property('domain');
                expect(result).to.have.property('isFree');
                done();
            })
        })
    })

    describe("domainrcheck", function(){
        it("'google.com'.status === registrar", function(done){
            domainService.domainrCheck("google.com").then(function(result){
                assert.equal(result.status[0].summary,"registrar")
                done();
            })
        })
    })

    describe("isAvailable", function(){
        it("'yandex.com' === 0", function(done){
            domainService.isAvail("yandex.com").then(function(result){
                assert.equal(result,0);
                done();
            })
        })

        it("'demeschhikisverycool.com' === 2", function(done){
            domainService.isAvail("demeschhikisverycool.com").then(function(result){
                assert.equal(result,2);
                done();
            })
        })

    })

    describe("getDomains", function(){
        it("Результат = объект, мета = объект, данные = массив", function(done){
            domainService.getDomains({}).then(function(result){
                expect(result).to.be.an('object');
                expect(result.meta).to.be.an('object');
                expect(result.domains).to.be.an('array');
                done();
            })
        })
    })

    describe('create', function(){
        it("Created domain", function(done){
            var req={};
            req.body={
                "domain":"verysimpledomain.com",
                "price":10000
            };
            domainService.create({},req).then(function(result){
                expect(result).to.be.an('object');
                expect(result).to.have.property('domain');
                done();
            })
        })
    })

    describe("delete", function(){
        it("должна вернуться ошибка", function(done){
          domainService.delete({}).catch(function (result){
              assert.deepEqual(result, errors.accessDenied);
              done();
          })  
        })
    })
})

describe("userService", function(){
    
    describe("read",function(){

        it("return users", function(done){
            var req={};
            req.params={};
            req.query={};
            userService.read(req).then(function(result){
                expect(result).to.be.an('object');
                expect(result.meta).to.be.an('object');
                done();
            })
        })

        it("return user", function(done){
            var req={};
            req.params={};
            req.params.id=8;
            req.query={};
            userService.read(req).then(function(result){
                expect(result).to.be.an('object');
                expect(result).to.have.property('username');
                done();
            })
        })

    })

    describe('create', function(){
        it("Created user", function(done){
            var req={};
            req.body={
                "username":"testuser",
                "password":"1234578",
                "cash":10000
            };
            userService.create({},req).then(function(result){
                expect(result).to.be.an('object');
                expect(result).to.have.property('cash');
                done();
            })
        })
    })

    describe("delete", function(){
        
        it("respond with error",function(done){
            userService.delet({}).catch(function(result){
                assert.deepEqual(result, errors.accessDenied);
                done();
            })
        })
    })

})