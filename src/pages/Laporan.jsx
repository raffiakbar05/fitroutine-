import React, { useState, useEffect } from 'react';
import BottomNav from "../components/BottomNav.jsx";
import API from '../api/axiosConfig';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Zap, Moon, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const Laporan = () => {
  const [laporanHariIni, setLaporanHariIni] = useState(null);
  const [laporanMingguan, setLaporanMingguan] = useState(null);
  const [rekomendasi, setRekomendasi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const userRaw = localStorage.getItem('user');
        if (!userRaw) {
          setLoading(false);
          return;
        }

        const userData = JSON.parse(userRaw);
        const uid = userData?.id || userData?.user?.id;
        setUserId(uid);

        // Fetch laporan hari ini
        const resHariIni = await API.get(`/api/laporan/hari-ini/${uid}`);
        setLaporanHariIni(resHariIni.data.data);

        // Fetch laporan mingguan
        const resMingguan = await API.get(`/api/laporan/mingguan/${uid}`);
        setLaporanMingguan(resMingguan.data.data);

        // Fetch rekomendasi
        const resRekomendasi = await API.get(`/api/laporan/rekomendasi/${uid}`);
        setRekomendasi(resRekomendasi.data.data);

        console.log('📊 Laporan loaded successfully');
      } catch (err) {
        console.error('❌ Error loading laporan:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="pb-28 p-6 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#54BAB9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#54BAB9] font-semibold">Memuat laporan...</p>
        </div>
      </div>
    );
  }

  if (!laporanHariIni) {
    return (
      <div className="pb-28 p-6 bg-white min-h-screen">
        <h1 className="text-3xl font-bold text-[#54BAB9] mt-6">Laporan</h1>
        <p className="text-gray-400 mb-10">Belum ada data untuk ditampilkan</p>
        <BottomNav />
      </div>
    );
  }

  const COLORS = ['#54BAB9', '#45a8a7', '#FF8C42', '#FFB347'];
  const pieData = [
    { name: 'Selesai', value: laporanHariIni.completedActivities },
    { name: 'Belum Selesai', value: laporanHariIni.totalActivities - laporanHariIni.completedActivities }
  ];

  return (
    <div className="pb-28 p-6 bg-gradient-to-br from-[#F8F9FA] to-white min-h-screen">
      {/* Header */}
      <div className="mt-6 mb-8">
        <h1 className="text-4xl font-bold text-[#54BAB9] mb-2">Laporan Anda</h1>
        <p className="text-gray-500 font-medium">Analisis performa dan rekomendasi AI</p>
      </div>

      {/* ===== LAPORAN HARI INI ===== */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Clock size={24} className="text-[#54BAB9]" />
          Laporan Hari Ini
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Total Aktivitas */}
          <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-sm font-bold mb-2">Total Aktivitas</p>
            <h3 className="text-4xl font-black text-gray-800">{laporanHariIni.totalActivities}</h3>
            <p className="text-xs text-gray-400 mt-1">Jadwal hari ini</p>
          </div>

          {/* Aktivitas Selesai */}
          <div className="p-4 bg-white rounded-2xl border border-green-200 shadow-sm">
            <p className="text-gray-500 text-sm font-bold mb-2">Selesai</p>
            <h3 className="text-4xl font-black text-green-500">{laporanHariIni.completedActivities}</h3>
            <p className="text-xs text-green-400 mt-1">Aktivitas rampung</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800">Kemajuan Penyelesaian</h3>
            <span className="text-3xl font-black text-[#54BAB9]">{laporanHariIni.percentageCompletion}%</span>
          </div>
          <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#54BAB9] to-[#45a8a7] h-full transition-all duration-500 rounded-full"
              style={{ width: `${laporanHariIni.percentageCompletion}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-3">{laporanHariIni.completedActivities} dari {laporanHariIni.totalActivities} aktivitas selesai</p>
        </div>

        {/* Pie Chart */}
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Distribusi Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== JAM TIDUR & KESEHATAN ===== */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Moon size={24} className="text-[#54BAB9]" />
          Analisis Kesehatan
        </h2>

        <div className="p-6 bg-gradient-to-br from-[#54BAB9]/5 to-[#45a8a7]/5 rounded-2xl border-2 border-[#54BAB9]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-bold mb-2">Durasi Istirahat Ideal</p>
              <h3 className="text-5xl font-black text-[#54BAB9]">{laporanHariIni.sleepDuration}h</h3>
              <p className="text-sm text-gray-600 mt-2">Jam {laporanHariIni.user?.jam_bangun} - {laporanHariIni.user?.jam_tidur}</p>
            </div>
            <div className="text-[#54BAB9]/20">
              <Moon size={80} />
            </div>
          </div>
          <div className="mt-4 p-3 bg-white/50 rounded-xl">
            <p className="text-xs text-gray-600">
              {laporanHariIni.sleepDuration >= 7 && laporanHariIni.sleepDuration <= 9
                ? '✅ Waktu tidur Anda sudah ideal (7-9 jam)'
                : laporanHariIni.sleepDuration < 7
                ? '⚠️ Waktu tidur kurang, perlu ditingkatkan'
                : '⚠️ Waktu tidur terlalu lama, coba kurangi'}
            </p>
          </div>
        </div>
      </div>

      {/* ===== STATISTIK MINGGUAN ===== */}
      {laporanMingguan && laporanMingguan.activityStats.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={24} className="text-[#54BAB9]" />
            Statistik Aktivitas
          </h2>

          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={laporanMingguan.activityStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="activity"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="percentage"
                  fill="#54BAB9"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Aktivitas Details */}
          <div className="mt-6 space-y-3">
            {laporanMingguan.activityStats.map((stat, idx) => (
              <div key={idx} className="p-4 bg-white rounded-xl border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-gray-800">{stat.activity}</h4>
                  <span className="text-lg font-black text-[#54BAB9]">{stat.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#54BAB9] h-full rounded-full"
                    style={{ width: `${stat.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{stat.completed} dari {stat.total} selesai</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== REKOMENDASI AI ===== */}
      {rekomendasi && rekomendasi.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Zap size={24} className="text-[#54BAB9]" />
            Rekomendasi AI
          </h2>

          <div className="space-y-3">
            {rekomendasi.map((rec, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border-2 flex gap-3 ${
                  rec.type === 'success'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex-shrink-0 pt-0.5">
                  {rec.type === 'success' ? (
                    <CheckCircle size={20} className="text-green-500" />
                  ) : (
                    <AlertCircle size={20} className="text-yellow-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-bold ${rec.type === 'success' ? 'text-green-700' : 'text-yellow-800'}`}>
                    {rec.message}
                  </p>
                  {rec.percentage && (
                    <p className="text-sm text-gray-600 mt-1">Konsistensi: {rec.percentage}%</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivasi */}
      <div className="p-6 bg-gradient-to-br from-[#54BAB9]/10 to-[#45a8a7]/10 rounded-2xl border border-[#54BAB9]/20">
        <p className="text-gray-700 text-sm leading-relaxed">
          💪 <span className="font-bold">Motivasi Harian:</span> Konsistensi adalah kunci kesuksesan. Setiap hari yang Anda jalani dengan baik membawa Anda lebih dekat ke tujuan hidup sehat. Terus semangat!
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default Laporan;