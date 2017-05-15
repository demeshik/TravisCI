const express = require("express");
const Promise = require("bluebird");

module.exports = (AuthService, userService, domainService, errors)=>{
    const router = express.Router();

    const authController = require('./authControl')(AuthService, promiseHandler);
    const userController = require('./userControl')(userService, promiseHandler);
    const domainController = require('./domainControl')(domainService, promiseHandler);

    
    router.use('/session',authController);
    router.use('/users',userController);
    router.use('/domains',domainController);
    return router;
};

function promiseHandler(res, promise) {
    promise
        .then((data) => res.sendJsonXml(data))
        .catch((err) => res.error(err));
}