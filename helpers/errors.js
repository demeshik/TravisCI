const express = require('express');

express.response.error = function(error) {
    if (!error.code) {
        error = {
            message: error.toString(),
            code: 'server_error',
            status: 500
        };
    }

    this.status(error.status).json(error);

};

module.exports = {
    wrongCredentials: {
        message: 'Password isn\'t correct.',
        code: 'wrong_Credentials',
        status: 401
    },
    wrongParams:{
        message: 'One or more parameters are null',
        code: 'wrong_parameters',
        status:400
    },
    notFound: {
        message: 'Entity not found',
        code: 'entity_not_found',
        status: 404
    },
    nonAuthorized:{
        message:'Unauthorized',
        code:'Unauthorized',
        status:401
    },
    serverError: {
        message: 'Something was wrong:( It isn\'t your fault.',
        code: 'server_error',
        status: 500
    },
    accessDenied: {
        message: 'Access denied',
        code: 'access_denied',
        status: 403
    }
};