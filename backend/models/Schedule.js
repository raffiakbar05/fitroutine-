module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Schedule', {
    user_id: { type: DataTypes.INTEGER },
    waktu: { type: DataTypes.TIME },
    kegiatan: { type: DataTypes.STRING },
    catatan: { type: DataTypes.TEXT }
  }, {
    tableName: 'schedules',
    timestamps: false // Sesuai gambar tabel schedules Anda yang tidak punya createdAt
  });
};