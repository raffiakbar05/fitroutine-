const mysql = require('mysql2');
require('dotenv').config();

const dbName = process.env.DB_NAME || 'fitroutine_db';

// Koneksi tanpa database terlebih dahulu
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Koneksi ke MySQL gagal:', err.message);
    process.exit(1);
  }
  console.log('✅ Koneksi ke MySQL berhasil!');

  // Buat database
  connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`, (err) => {
    if (err) {
      console.error('❌ Error membuat database:', err.message);
      process.exit(1);
    }
    console.log('✅ Database berhasil dibuat/ada');

    // Gunakan database
    connection.query(`USE ${dbName}`, (err) => {
      if (err) {
        console.error('❌ Error menggunakan database:', err.message);
        process.exit(1);
      }

      // Buat tabel users
      const usersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INT PRIMARY KEY AUTO_INCREMENT,
          nama VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          jam_bangun TIME DEFAULT '06:00:00',
          jam_tidur TIME DEFAULT '22:00:00',
          aktivitas VARCHAR(255) DEFAULT 'Olahraga',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `;

      connection.query(usersTable, (err) => {
        if (err) {
          console.error('❌ Error membuat tabel users:', err.message);
          process.exit(1);
        }
        console.log('✅ Tabel users berhasil dibuat/ada');

        // Buat tabel schedules
        const schedulesTable = `
          CREATE TABLE IF NOT EXISTS schedules (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            waktu TIME NOT NULL,
            kegiatan VARCHAR(255) NOT NULL,
            catatan TEXT,
            is_completed BOOLEAN DEFAULT FALSE,
            completed_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_id (user_id)
          )
        `;

        connection.query(schedulesTable, (err) => {
          if (err) {
            console.error('❌ Error membuat tabel schedules:', err.message);
            process.exit(1);
          }
          console.log('✅ Tabel schedules berhasil dibuat/ada');

          // Buat tabel reminders
          const remindersTable = `
            CREATE TABLE IF NOT EXISTS reminders (
              id INT PRIMARY KEY AUTO_INCREMENT,
              user_id INT NOT NULL,
              schedule_id INT NOT NULL,
              reminder_time TIME NOT NULL,
              is_sent BOOLEAN DEFAULT FALSE,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
              FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE
            )
          `;

          connection.query(remindersTable, (err) => {
            if (err) {
              console.error('❌ Error membuat tabel reminders:', err.message);
              process.exit(1);
            }
            console.log('✅ Tabel reminders berhasil dibuat/ada');
            console.log('\n🎉 Database setup berhasil!');
            connection.end();
            process.exit(0);
          });
        });
      });
    });
  });
});
