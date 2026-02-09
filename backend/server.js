const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

const dbConfig = {
host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'fitroutine_db'
};

async function testConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ MySQL Connected!');
    await connection.end();
  } catch (error) {
    console.error('❌ MySQL Error:', error.message);
  }
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const { nama, email, password } = req.body;
    const connection = await mysql.createConnection(dbConfig);
    
    const [existing] = await connection.execute('SELECT email FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      await connection.end();
      return res.status(400).json({ msg: "Email sudah terdaftar" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await connection.execute(
      'INSERT INTO users (nama, email, password) VALUES (?, ?, ?)',
      [nama, email, hashedPassword]
    );
    
    await connection.end();
    res.json({ success: true, user: { id: result.insertId, nama, email } });
  } catch (error) {
    res.status(500).json({ msg: "Error database: " + error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('--- 🛡️  PROSES LOGIN DIMULAI ---');
    console.log('1. Mencoba login untuk:', email);

    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    await connection.end();
    
    if (rows.length === 0) {
      console.log('❌ 2. User tidak ditemukan di database.');
      return res.status(400).json({ msg: "Email tidak ditemukan" });
    }
    
    const user = rows[0];
    console.log('2. User ditemukan:', user.nama);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('3. Apakah password cocok?', isMatch);
    
    if (!isMatch) {
      console.log('❌ 4. Password salah.');
      return res.status(400).json({ msg: "Password salah" });
    }
    
    const secret = process.env.JWT_SECRET || 'secret123';
    console.log('4. Menggenerate token...');
    
    const token = jwt.sign({ id: user.id }, secret, { expiresIn: '1d' });
    console.log('✅ 5. Login Berhasil, Token dikirim!');

    res.json({ 
      success: true, 
      token, 
      user: { id: user.id, nama: user.nama, email: user.email } 
    });
  } catch (error) {
    console.error('🔥 CRITICAL ERROR LOGIN:', error.message);
    res.status(500).json({ msg: "Server Error: " + error.message });
  }
});

app.post('/api/user/pengaturan', async (req, res) => {
  try {
    const { userId, jam_bangun, jam_tidur, aktivitas } = req.body;
    
    // Validasi input
    if (!userId || !jam_bangun || !jam_tidur || !aktivitas) {
      return res.status(400).json({ msg: "Data tidak lengkap. Pastikan semua field terisi." });
    }

    // Format waktu (HH:MM -> HH:MM:SS)
    const formatTime = (time) => {
      if (!time) return '00:00:00';
      if (time.includes(':') && time.split(':').length === 2) {
        return time + ':00';
      }
      return time;
    };

    const formattedJamBangun = formatTime(jam_bangun);
    const formattedJamTidur = formatTime(jam_tidur);

    const connection = await mysql.createConnection(dbConfig);
    
    // Update user settings
    await connection.execute(
      'UPDATE users SET jam_bangun = ?, jam_tidur = ?, aktivitas = ? WHERE id = ?',
      [formattedJamBangun, formattedJamTidur, aktivitas, userId]
    );
    
    // Hapus jadwal lama
    await connection.execute('DELETE FROM schedules WHERE user_id = ?', [userId]);
    
    // Buat jadwal baru
    const jadwalData = [
      [userId, '06:00:00', 'Bangun Pagi', 'Mulai hari dengan semangat'],
      [userId, '07:00:00', 'Sarapan', 'Makan bergizi untuk energi'],
      [userId, '08:00:00', aktivitas, 'Aktivitas utama hari ini'],
      [userId, '12:00:00', 'Makan Siang', 'Istirahat dan makan siang'],
      [userId, '14:00:00', 'Aktivitas Sore', 'Lanjutkan kegiatan produktif'],
      [userId, '18:00:00', 'Makan Malam', 'Makan malam bersama keluarga'],
      [userId, '20:00:00', 'Relaksasi', 'Waktu santai dan istirahat'],
      [userId, formattedJamTidur, 'Tidur', 'Istirahat yang cukup']
    ];
    
    for (const jadwal of jadwalData) {
      await connection.execute('INSERT INTO schedules (user_id, waktu, kegiatan, catatan) VALUES (?, ?, ?, ?)', jadwal);
    }
    
    await connection.end();
    console.log('✅ Pengaturan berhasil disimpan untuk user:', userId);
    res.json({ success: true, msg: "Pengaturan berhasil disimpan!" });
  } catch (error) {
    console.error('❌ Pengaturan Error:', error.message);
    res.status(500).json({ msg: "Error database saat menyimpan pengaturan: " + error.message });
  }
});

app.get('/api/get-jadwal/:userId', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT * FROM schedules WHERE user_id = ? ORDER BY waktu ASC', 
      [req.params.userId]
    );
    await connection.end();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ msg: 'Error mengambil jadwal' });
  }
});

app.post('/api/mark-activity-complete', async (req, res) => {
  try {
    const { scheduleId, userId } = req.body;
    
    if (!scheduleId || !userId) {
      return res.status(400).json({ msg: 'scheduleId dan userId required' });
    }

    const connection = await mysql.createConnection(dbConfig);
    
    // Update schedule dengan status completed
    await connection.execute(
      'UPDATE schedules SET is_completed = 1, completed_at = NOW() WHERE id = ? AND user_id = ?',
      [scheduleId, userId]
    );
    
    await connection.end();
    
    console.log(`✅ Activity ${scheduleId} marked as complete for user ${userId}`);
    res.json({ success: true, msg: 'Aktivitas berhasil ditandai selesai' });
  } catch (error) {
    console.error('❌ Mark Complete Error:', error.message);
    res.status(500).json({ msg: 'Error saat menandai aktivitas selesai' });
  }
});

// ===== LAPORAN API ENDPOINTS =====

// Endpoint: GET /api/laporan/hari-ini/:userId
// Deskripsi: Ambil laporan untuk hari ini
app.get('/api/laporan/hari-ini/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const connection = await mysql.createConnection(dbConfig);

    // Ambil data jadwal hari ini
    const [schedules] = await connection.execute(
      'SELECT id, waktu, kegiatan, is_completed FROM schedules WHERE user_id = ?',
      [userId]
    );

    // Ambil data user untuk jam tidur/bangun
    const [users] = await connection.execute(
      'SELECT jam_bangun, jam_tidur FROM users WHERE id = ?',
      [userId]
    );

    await connection.end();

    const totalActivities = schedules.length;
    const completedActivities = schedules.filter(s => s.is_completed === 1).length;
    const percentageCompletion = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

    // Analisis jam tidur
    const sleepData = users.length > 0 ? users[0] : null;
    let sleepDuration = 0;
    if (sleepData) {
      const bangun = parseInt(sleepData.jam_bangun.split(':')[0]);
      const tidur = parseInt(sleepData.jam_tidur.split(':')[0]);
      sleepDuration = tidur > bangun ? (24 - tidur + bangun) : (bangun - tidur);
    }

    res.json({
      success: true,
      data: {
        totalActivities,
        completedActivities,
        percentageCompletion,
        sleepDuration,
        activities: schedules,
        user: sleepData
      }
    });
  } catch (error) {
    console.error('❌ Laporan Hari Ini Error:', error.message);
    res.status(500).json({ msg: 'Error mengambil laporan harian' });
  }
});

// Endpoint: GET /api/laporan/mingguan/:userId
// Deskripsi: Ambil laporan statistik mingguan
app.get('/api/laporan/mingguan/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const connection = await mysql.createConnection(dbConfig);

    // Ambil data jadwal dari 7 hari terakhir (simulasi dengan semua data)
    const [schedules] = await connection.execute(
      `SELECT 
        id, kegiatan, is_completed, DATE(completed_at) as completion_date
       FROM schedules 
       WHERE user_id = ? AND completed_at IS NOT NULL
       ORDER BY completed_at DESC LIMIT 56`,
      [userId]
    );

    // Hitung statistik per aktivitas
    const activityStats = {};
    schedules.forEach(schedule => {
      const activity = schedule.kegiatan;
      if (!activityStats[activity]) {
        activityStats[activity] = { completed: 0, total: 0 };
      }
      if (schedule.is_completed === 1) {
        activityStats[activity].completed++;
      }
      activityStats[activity].total++;
    });

    // Konversi ke array dan hitung persentase
    const activityPercentages = Object.entries(activityStats).map(([activity, stats]) => ({
      activity,
      completed: stats.completed,
      total: stats.total,
      percentage: Math.round((stats.completed / stats.total) * 100)
    }));

    await connection.end();

    res.json({
      success: true,
      data: {
        activityStats: activityPercentages,
        totalDataPoints: schedules.length
      }
    });
  } catch (error) {
    console.error('❌ Laporan Mingguan Error:', error.message);
    res.status(500).json({ msg: 'Error mengambil laporan mingguan' });
  }
});

// Endpoint: GET /api/laporan/rekomendasi/:userId
// Deskripsi: Ambil rekomendasi AI berdasarkan data
app.get('/api/laporan/rekomendasi/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const connection = await mysql.createConnection(dbConfig);

    // Ambil data jadwal
    const [schedules] = await connection.execute(
      'SELECT waktu, kegiatan, is_completed FROM schedules WHERE user_id = ?',
      [userId]
    );

    // Ambil data user
    const [users] = await connection.execute(
      'SELECT jam_tidur, jam_bangun FROM users WHERE id = ?',
      [userId]
    );

    await connection.end();

    const rekomendasi = [];

    // Analisis aktivitas yang sering terlewat
    const activityCompletion = {};
    schedules.forEach(s => {
      if (!activityCompletion[s.kegiatan]) {
        activityCompletion[s.kegiatan] = { completed: 0, total: 0 };
      }
      activityCompletion[s.kegiatan].total++;
      if (s.is_completed === 1) activityCompletion[s.kegiatan].completed++;
    });

    // Buat rekomendasi berdasarkan aktivitas yang terlewat
    for (const [activity, stats] of Object.entries(activityCompletion)) {
      const percentage = Math.round((stats.completed / stats.total) * 100);
      
      if (percentage < 50) {
        rekomendasi.push({
          type: 'warning',
          message: `Anda sering melewatkan "${activity}". Cobalah atur alarm untuk mengingat jadwal ini.`,
          activity,
          percentage
        });
      } else if (percentage >= 80) {
        rekomendasi.push({
          type: 'success',
          message: `Mantap! Anda sangat disiplin dalam "${activity}" (${percentage}% selesai).`,
          activity,
          percentage
        });
      }
    }

    // Analisis jam tidur
    if (users.length > 0) {
      const tidur = parseInt(users[0].jam_tidur.split(':')[0]);
      const bangun = parseInt(users[0].jam_bangun.split(':')[0]);
      const durasiTidur = tidur > bangun ? (24 - tidur + bangun) : (bangun - tidur);

      if (durasiTidur < 6) {
        rekomendasi.push({
          type: 'warning',
          message: `Waktu tidur Anda hanya ${durasiTidur} jam. WHO merekomendasikan 7-9 jam untuk orang dewasa.`,
          category: 'sleep'
        });
      } else if (durasiTidur >= 7 && durasiTidur <= 9) {
        rekomendasi.push({
          type: 'success',
          message: `Waktu tidur Anda ideal (${durasiTidur} jam). Pertahankan pola ini!`,
          category: 'sleep'
        });
      }
    }

    res.json({
      success: true,
      data: rekomendasi
    });
  } catch (error) {
    console.error('❌ Rekomendasi Error:', error.message);
    res.status(500).json({ msg: 'Error mengambil rekomendasi' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
  testConnection();
});