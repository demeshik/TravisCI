const express = require('express');
const Promise = require("bluebird");

function baseControl(service, promiseHandler) {
    var self = this;

    this.registerRoutes = registerRoutes;
    this.router = express.Router();

    this.routes = {
        '/': [  { method: 'get', cb: read }, 
                { method: 'post', cb: create },
                { method: 'put', cb: update }
            ],
        '/:id':[{ method: 'get', cb: read },
                { method: 'put', cb: update },
                { method: 'delete', cb: delet }
            ]
    }

    function read(req, res) {
        promiseHandler(res, service.read(req));
    }

    function getEntity(req, res){
        promiseHandler(res, service.getEntity(req));
    }

    function create(req, res) {
        promiseHandler(res, service.create(res, req));
    }

    function update(req,res){
        promiseHandler(res, service.update(req));
    }

    function delet(req, res) {
        promiseHandler(res, service.delete(req));
    }

    function registerRoutes() {
        for (var route in self.routes) {
            if (!self.routes.hasOwnProperty(route)) {
                continue;
            }
            var handlers = self.routes[route];
            if (handlers == undefined) continue;
            for (var handler of handlers) {
                self.router[handler.method](route, handler.cb);
            }
        }
    }
}
module.exports = baseControl;