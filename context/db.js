module.exports = (Sequelize, config) => {
    const options = {
        host: config.db.host,
        dialect: config.db.dialect,
        logging: false,
        define: {
            timestamps: true,
            paranoid: true,
            defaultScope: {
                where: {
                    deletedAt: { $eq: null }
                }
            }
        }
    };

    var sequelize = null;

    if(!!process.env.DATABASE_URL)
    {
        sequelize = new Sequelize(process.env.DATABASE_URL,
	    {
		define: {
                timestamp: true,
                paranoid: true
        }});
    }
    else
    {
        sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, options);
    }

    const User = require('../models/user')(Sequelize, sequelize);
    const Domains = require('../models/domains')(Sequelize, sequelize);

    Domains.belongsTo(User);
    User.hasMany(Domains);

    return {
        user: User,
        domains:Domains,
        sequelize: sequelize
    };
};