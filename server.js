var server = require('./index.js');
var port = process.env.PORT || 5547;

server.dbcontext.sequelize
    .sync()
    .then(()=>{
        server.app.listen(port,()=>console.log('Running on the 3000 port'));
    })
    .catch((err)=>console.log(err));

module.exports.app = server.app;