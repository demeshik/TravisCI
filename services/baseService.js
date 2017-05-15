"use strict"
module.exports = BaseService;

function BaseService(repository, errors) {
    
    const config = require('../config.json');

    var self = this;

    this.conf = config;
    this.baseCreate = baseCreate;
    this.baseUpdate = baseUpdate;
    this.baseDelete = baseDelete;

    
    function baseCreate(data) {
        return new Promise((resolve, reject) => {
            repository.create(data)
                .then(resolve).catch(reject);
        });
    }

    function baseUpdate(id, data) {
        return new Promise((resolve, reject) => {
            data.save()
                .then(resolve).catch(reject);
        });
    }

    function baseDelete(_id) {
        return new Promise((resolve, reject) => {
            repository.destroy({where:{id:_id}})
                .then(resolve).catch(reject);
        });
    }
}