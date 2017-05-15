module.exports = (userService, promiseHandler)=>{

    const Base = require('./baseControl');

    Object.setPrototypeOf(UserController.prototype,Base.prototype);

    function UserController(promiseHandler) {

        Base.call(this, userService, promiseHandler);
        
        this.registerRoutes();
        return this.router;
    }

    return new UserController(promiseHandler);
};