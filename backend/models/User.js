module.exports = (sequelize, DataTypes) => {
  return sequelize.define('User', {
    nama: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    password: DataTypes.STRING,
    jam_bangun: DataTypes.TIME,
    jam_tidur: DataTypes.TIME,
    aktivitas: DataTypes.STRING
  }, { tableName: 'users' });
};