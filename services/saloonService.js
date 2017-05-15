'use strict';
const Promise = require("bluebird");

module.exports = (saloonRepository, carRepository, errors) => {
    const BaseService = require('./baseService');
    const config =require('../config.json');

    Object.setPrototypeOf(SaloonService.prototype, BaseService.prototype);

    function SaloonService(saloonRepository, errors) {

        BaseService.call(this, saloonRepository, errors);
        let self = this;
        self.searchss = search;
        self.create = create;
        self.update = update;
        self.delet = del;

        function search(options) {
             return new Promise((resolve,reject)=>{
                saloonRepository.findAll({
                    where:{
                        title:options.q
                    }
                }).then((data)=>{
                    resolve(data);
                }).catch(reject);
             });
        }

        function create(data) {
            return new Promise((resolve, reject) => {
                if(!!data.title && !!data.capacity)
                {
                    let exsaloon = {
                        title: data.title,
                        capacity:parseInt(data.capacity),
                    };

                    self.baseCreate(exsaloon).then(resolve).catch(reject);
                }
                else
                    reject(errors.wrongParams);
            });
        }

        function update(data) {
            return new Promise((resolve, reject) => {

                if(!!data.id && !isNaN(parseInt(data.id)))
                {
                    var saloon = new Object();
                    if(!!data.title)
                        saloon.title = data.title;
                    if(!!data.capacity)
                        saloon.capacity = data.capacity;
                    

                    self.baseUpdate(data.id, saloon)
                        .then(resolve).catch(reject);
                }
                else
                    reject(errors.invalidId);
            });
        }

        function del(id) {
            
            return new Promise((resolve,reject)=>{
                id = parseInt(id);

                if(isNaN(id)){
                    reject(errors.invalidId);
                    return;
                }

                Promise.all([
                    carRepository.destroy({where:{saloonId:id}}),
                    self.baseDelete(id)
                ]).then(()=>resolve({status:true})).catch(reject);

            })
        }
    }

    return new SaloonService(saloonRepository, errors);
};