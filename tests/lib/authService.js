"use strict";
var Promise = require("bluebird");
var jwt = require("jwt-simple");
var bcrypt = require('bcryptjs');


const saltRounds = 10;

module.exports = (userRepository, Domains, config, errors) => {

    return {
        login: login,
        getInfo: getInfo
    };

    function login(data) {
        return new Promise((resolve, reject) => {

            if(!data.username||!data.password)
                reject(errors.wrongParams);
            
            let username = data.username;
            let password = data.password;

            userRepository.findOne({
                where: {
                    username: username
                }
            })
            .then((user) => {
                bcrypt.compare(password, user.password, function (err, valid) {
                        if (err)
                            reject(errors.serverError);
                        if(!valid)
                            reject(errors.wrongCredentials);
                        
                        var token = jwt.encode({username:username}, config.secretKey);
                        resolve(token);
                });
            })
            .catch((err)=>reject(errors.serverError));
        });
    }

    function getInfo(headers) {
            return new Promise((resolve, reject)=>{

                    let userName = null;
                    try{
                        userName = jwt.decode(headers['x-auth'], config.secretKey).username;
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
                        //data = JSON.parse(JSON.stringify(data));
                        //data.Domains = data.Domains.map(element =>({Domain:JSON.parse(JSON.stringify(element))}));
                        resolve(data);
                    })
                    .catch(reject);
            });
        }
};