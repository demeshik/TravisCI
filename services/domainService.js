'use strict';
const Promise = require("bluebird");
const bcryptjs = require("bcryptjs");
var jwt = require("jwt-simple");
const needle = require("needle");
const config = require('../config.json');

const saltRounds = 10;

module.exports = (domainRepository, userRepository, errors) => {
    const BaseService = require('./baseService');

    Object.setPrototypeOf(DomainService.prototype, BaseService.prototype);

    function DomainService(domainRepository, userRepository, errors) {

        BaseService.call(this, domainRepository, errors);

        let self = this;
        self.read = read;
        self.create = create;
        self.update = update;
        self.delete = del;

        function localCheck(_domain, _id){
            return new Promise((resolve,reject)=>{
                if(_id===undefined)
                    domainRepository.findOne({where:{domain:_domain}})
                    .then(dom=>{
                        resolve(dom);
                    })
                    .catch(reject);
                else
                    domainRepository.findOne({where:{id:_id}})
                    .then(dom=>{
                        resolve(dom);
                    })
                    .catch(reject);
            })
        }

        function domainrCheck(_domain){
            return new Promise((resolve,reject)=>{
                var options={headers:{'Origin':'https://www.namecheap.com'}};
                needle.get('https://api.domainr.com/v2/status?domain='+_domain+'&client_id=fb7aca826b084569a50cfb3157e924ae',
                            options,function(err,data){
                                if(!err)
                                    resolve(data.body);
                                else
                                    reject(errors.serverError);
                });
            })
        }

        function isAvail(domain, id){
            return new Promise((resolve, reject)=>{

                var local = localCheck(domain, id);
                var domainr = domainrCheck(domain);

                Promise.all([local,domainr])
                .then(values=>{
                    if(values[0]==null)
                    {
                        if(values[1].status[0].summary=='inactive')
                            resolve(2);
                        else
                            resolve(0);
                    }
                    else
                    {
                        if(values[0].isFree)
                            resolve(2);
                        else
                            resolve(0);
                    }
                })
                .catch(reject);
            })
        }

        function read(req){
            return new Promise((resolve, reject) => {
                if(!!req.params.id)
                    resolve(getDomain(req.params.id));
                else
                {
                    if(!!req.query.q){
                        isAvail(req.query.q)
                        .then((id)=>{
                            if(id==0)
                                resolve({"status":"busy"})
                            else
                                resolve({"status":"free"})
                        })
                        .catch(reject);
                    }
                    else{
                        resolve(getDomains(req.query));
                    }
                }
            });
        }

        function getDomain(_id){
            return new Promise((resolve, reject)=>{
                domainRepository.findOne({attributes:['id','domain','isFree','price'],
                                        where:{id:_id}})
                .then(domain =>{
                    resolve(domain.get({plain:true}));
                })
                .catch(reject);
            })
        }

        function getDomains(data){
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
                domainRepository.findAndCountAll({
                                limit:_limit,
                                offset:_offset,
                                attributes:['id','domain','isFree','price']})
                .then(domains => 
                {
                    var answer = {};
                    answer.meta = {};
                    answer.meta.total = domains.count;
                    answer.meta.limit = _limit;
                    answer.meta.offset = _offset;
                    answer.domains = domains.rows.map(element => ({domain:JSON.parse(JSON.stringify(element))}));

                    resolve(answer);
                })
                .catch(reject);
            });
        }

        function create(res, req){
            return new Promise((resolve, reject)=>{

                var domain = {
                    domain:req.body.domain,
                    isFree: true,
                    price: req.body.price,
                    userId:null
                };

                self.baseCreate(domain)
                .then((_domain)=>{
                    res.sendJsonXml({"id":_domain.id,"domain":_domain.domain, "price":_domain.price});
                })
                .catch(reject);
            });
        }

        function update(req) {
            return new Promise((resolve, reject)=>{
                if(!!req.params.id)
                    resolve(updateEntity(req));
                else
                    reject(errors.wrongParams);
            });
        }
        
        function updateEntity(req){
            return new Promise((resolve, reject) => {
                isAvail("", req.params.id)
                .then((id) => {
                    console.log('isavai');
                    if(id == 0)
                        resolve({"status":"busy"});
                    if(id == 2)
                    {
                        if(!req.headers['x-auth'])
                            reject(errors.nonAuthorized);

                        let userName = null;
                        try{
                            userName = jwt.decode(req.headers['x-auth'], self.conf.secretKey).username;
                        }
                        catch(err){
                            reject(errors.nonAuthorized)
                        }   

                        var user = userRepository.findOne({where:{username:userName}});
                        var domain = domainRepository.findOne({where:{id:req.params.id}});

                        Promise.all([user, domain])
                        .then((values)=>{
                            values[0].cash = values[0].cash - values[1].price;
                            values[1].userId = values[0].id;
                            values[1].isFree = false;

                            var updUser = self.baseUpdate(values[0].id, values[0]);
                            var updDomain = self.baseUpdate(values[1].id, values[1]);

                            Promise.all([updUser, updDomain])
                            .then(values=>{
                                resolve({"status":"OK"});
                            })
                            .catch(reject);

                        })
                        .catch(reject);
                    }
                })
                .catch(reject);
            });
        }



        function del(req) {
            return new Promise.reject(errors.accessDenied);
            /*return new Promise((resolve,reject)=>{
                if(!req.headers['x-auth'])
                    reject(errors.nonAuthorized);
            
                let userName = null;

                try{
                    userName = jwt.decode(req.headers['x-auth'], self.conf.secretKey).username;
                }
                catch(err){
                    reject(errors.nonAuthorized)
                }

                userRepository.findOne({
                    attributes:['id','username'],
                    where:{username:userName},
                    include:[{
                        model:Domains,
                        attributes:['id']
                    }]})
                .then((data)=>{
                    if(data.Domains)
                })
                .catch(reject);

                domainRepository.update({isFree:1, userId:NULL},{where:{id:dom.id}})
                                .then(()=>resolve({"status":"ok"}))
                                .catch(err=>resolve({"stat":err}))    
            });*/
        }
    }
    return new DomainService(domainRepository, userRepository, errors)
};