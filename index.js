const express = require('express');
const Sequelize = require('sequelize');
const bodParser = require('body-parser');
const errors = require('./helpers/errors');
const config = require('./config');
require("body-parser-xml")(bodParser);
const dbcontext = require('./context/db')(Sequelize, config);
const jsonxml = require("jsontoxml");


const authService = require('./services/authService')(dbcontext.user, dbcontext.domains, config, errors);
const userService = require('./services/userService')(dbcontext.user, dbcontext.domains, errors);
const domainService = require('./services/domainService')(dbcontext.domains,dbcontext.user, errors);

const apiControl = require('./controllers/apiControl')(authService, userService, domainService, errors);

const app = express();



app.use(bodParser.json());
app.use(bodParser.xml({
    xmlParseOptions:{
        explicitRoot:false,
        trim:true,
        explicitArray:false
    }
}));
app.use(function(req, res, next){
    if(req.get('Content-Type')=="application/xml")
        res.sendJsonXml = function(data){
            res.set('Content-Type','application/xml');
            var xml = jsonxml(data);
            res.send(xml);
        };
    else
        res.sendJsonXml = function(data){
            res.set('Content-Type','application/json');
            res.json(data);
        };
    next();
});
app.use('/api',apiControl);

module.exports.app = app;
module.exports.dbcontext = dbcontext;