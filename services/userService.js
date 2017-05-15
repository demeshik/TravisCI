'use strict';
const Promise = require("bluebird");
const bcryptjs = require("bcryptjs");
var jwt = require("jwt-simple");
const config = require('../config.json');

const saltRounds = 10;

module.exports = (userRepository, Domains,  errors) => {
    const BaseService = require('./baseService');

    Object.setPrototypeOf(UserService.prototype, BaseService.prototype);

    function UserService(userRepository, Domains, errors) {

        BaseService.call(this, userRepository, errors);

        let self = this;
        self.read = read;
        self.create = create;
        self.update = update;
        self.delet = del;

        function read(req){
            return new Promise((resolve, reject) => {

            if(!!req.params.id)
                resolve(getUser(req.params.id));
            else
            {
                resolve(getUsers(req.query));
            }
            });
        }

        function getInfo(headers) {
            return new Promise((resolve, reject)=>{

                    let userName = null;
                    try{
                        userName = jwt.decode(headers['x-auth'], self.conf.secretKey).username;
                    }
                    catch(err){
                        reject(errors.nonAuthorized)
                    }

                    userRepository.findOne({
                            attributes:['id','username','cash'],
                            where:{username:userName},
                            include:[{
                                model:Domains,
                                attributes:['domain','price']   
                            }]
                            })
                    .then((data)=>{
                        resolve(data);
                    })
                    .catch(reject);
            });
        }

        function getUser(_id){
            return new Promise((resolve, reject)=>{

                userRepository.findOne({attributes:['id','username','cash','createdAt'],
                                        where:{id:_id}})
                .then(user =>{
                    resolve(user.get({plain:true}));
                })
                .catch(reject);
            })
        }

        function getUsers(data){
            return new Promise((resolve, reject)=>{
                var _limit = null;
                var _offset = null;
                if(!!data.limit)
                    _limit = parseInt(data.limit);
                else
                    _limit = parseInt(config.limit);

                if(!!data.offset)
                    _offset = parseInt(data.offset);
                else
                    _offset = parseInt(config.offset);
                userRepository.findAndCountAll({
                                limit:_limit,
                                offset:_offset,
                                attributes:['id','username']})
                .then(users => 
                {
                    var answer = {};
                    answer.meta = {};
                    answer.meta.total = users.count;
                    answer.meta.limit = _limit;
                    answer.meta.offset = _offset;
                    answer.data = users.rows.map(element => ({user:JSON.parse(JSON.stringify(element))}));
                    resolve(answer);
                })
                .catch(reject);
            });
        }

        function create(res, req) {
            return new Promise((resolve, reject) => {
                bcryptjs.hash(req.body.password, saltRounds, function(err, hash) {
                    if (err) {
                        reject(errors.serverError);
                    }
                var user = {
                    username: req.body.username,
                    cash: parseInt(req.body.cash),
                    password: hash
                };
                userRepository.create(user)
                .then((user) => {
                        res.sendJsonXml({id:user.id,username:user.username,cash:user.cash});
                    })
                .catch(reject);
                });
            });
        }

        function update(req) {
            
            return new Promise((resolve, reject) => {

                if(!!req.params.id)
                {
                    userRepository.findOne({where:{id:req.params.id}})
                    .then((user)=>{
                        resolve(updEntity(req.body, user, req.params.id));
                    })
                    .catch(errors.serverError);
                }
                else
                {
                    if(req.headers['x-auth'])
                    {
                        let userName = jwt.decode(req.headers['x-auth'], self.conf.secretKey).username;

                        userRepository.findOne({where:{username:userName}})
                        .then((user)=>
                        {
                            resolve(updEntity(req.body, user, user.id));
                        })
                        .catch(errors.serverError);
                    }
                    else
                    {
                        reject(errors.nonAuthorized);
                    }
                }
            });
        }

        function updEntity(body, oldBody, id){
            return new Promise((resolve, reject)=>{
                Object.assign(oldBody,body);
                console.log('we are here');
                self.baseUpdate(id, oldBody)
                .then(()=>{
                    resolve({"status":"updated"});
                })
                .catch(reject);
            });
        }

       function del(id) {
        return new Promise.reject(errors.accessDenied);
            /*return new Promise((resolve, reject)=> {
                id = parseInt(id);

                if(isNaN(id)){
                    reject(errors.invalidId);
                    return;
                }

                self.baseDelete(id).then(resolve).catch(reject);
            })*/
        }
    
    }
    return new UserService(userRepository, Domains, errors);
}