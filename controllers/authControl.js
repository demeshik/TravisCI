const express = require('express');

module.exports = (AuthService,promiseHandler)=>{
    const router = express.Router();

    router.post('/',(req,res)=>{
        AuthService.login(req.body)
            .then((token)=>{
                    res.sendJsonXml({"token":token});
            })
            .catch((err)=>res.error(err));
    });

    router.get('/',(req,res)=>{
        AuthService.getInfo(req.headers)
            .then((data)=>{
                res.sendJsonXml(data);
            })
            .catch((err)=>res.error(err));
    });
    
    return router;
};