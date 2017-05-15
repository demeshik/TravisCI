module.exports = (domainService, promiseHandler)=>{

    const Base = require('./baseControl');

    Object.setPrototypeOf(DomainController.prototype,Base.prototype);

    function DomainController(promiseHandler) {

        Base.call(this,domainService, promiseHandler);
        
        this.registerRoutes();
        return this.router;
    }

    return new DomainController(promiseHandler);
};