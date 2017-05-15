module.exports = (Sequelize, sequelize)=>{
    return sequelize.define('Domains',{
        id:{
            type:Sequelize.INTEGER,
            allowNull:false,
            primaryKey:true,
            autoIncrement:true
        },
        domain:{type:Sequelize.STRING,allowNull:false},
        isFree:Sequelize.BOOLEAN,
        price:Sequelize.INTEGER
    });
};