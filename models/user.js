module.exports = (Sequelize, sequelize)=>{
    return sequelize.define('users',{
        id:{
            type:Sequelize.INTEGER,
            allowNull:false,
            primaryKey:true,
            autoIncrement:true
        },
        username:{
            type:Sequelize.STRING,
            allowNull:false,
            unique:true
        },
        password:Sequelize.STRING,
        cash:Sequelize.INTEGER
    });
};