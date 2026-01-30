const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql'
});

const User = require('./User')(sequelize, Sequelize);
const Schedule = require('./Schedule')(sequelize, Sequelize);

// Hubungkan relasi (Optional tapi bagus untuk integritas data)
User.hasMany(Schedule, { foreignKey: 'user_id' });
Schedule.belongsTo(User, { foreignKey: 'user_id' });

module.exports = { sequelize, User, Schedule };