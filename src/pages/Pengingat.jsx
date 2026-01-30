import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';
import BottomNav from '../components/BottomNav';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

const Pengingat = () => {
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationData, setNotificationData] = useState(null);
  const [completedActivities, setCompletedActivities] = useState([]);

  // Fetch jadwal dari database
  useEffect(() => {
    const fetchJadwal = async () => {
      try {
        const userRaw = localStorage.getItem('user');
        if (!userRaw) {
          setLoading(false);
          return;
        }

        const userData = JSON.parse(userRaw);
        const userId = userData?.id || userData?.user?.id;

        const res = await API.get(`/api/get-jadwal/${userId}`);
        setJadwal(res.data);

        // Set completed activities berdasarkan database
        const completed = res.data
          .filter(item => item.is_completed === 1)
          .map(item => item.id);
        setCompletedActivities(completed);

        console.log('📋 Jadwal loaded:', res.data.length, 'activities');
        console.log('✅ Completed activities:', completed.length);
      } catch (err) {
        console.error('Error mengambil jadwal:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJadwal();
  }, []);

  // Update waktu setiap detik dan cek notifikasi
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      checkNotifications(now);
    }, 1000);

    return () => clearInterval(interval);
  }, [jadwal]);

  // Fungsi untuk cek apakah waktu aktivitas sudah tiba
  const checkNotifications = (now) => {
    const currentHour = String(now.getHours()).padStart(2, '0');
    const currentMinute = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHour}:${currentMinute}`;

    jadwal.forEach((item) => {
      const scheduleTime = item.waktu.substring(0, 5); // Extract HH:MM from HH:MM:SS
      
      // Jika waktu cocok dan belum pernah ditampilkan di menit ini
      if (scheduleTime === currentTimeStr && !completedActivities.includes(item.id)) {
        setNotificationData({
          id: item.id,
          kegiatan: item.kegiatan,
          waktu: scheduleTime,
          catatan: item.catatan,
          timestamp: Date.now()
        });

        // Mainkan suara
        playNotificationSound();

        // Auto-hide notifikasi setelah 10 detik
        setTimeout(() => {
          setNotificationData(null);
        }, 10000);
      }
    });
  };

  // Fungsi untuk memainkan suara notifikasi
  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==');
    audio.play().catch(() => {});
  };

  // Tandai aktivitas sebagai selesai
  const markAsCompleted = async (scheduleId) => {
    try {
      const userRaw = localStorage.getItem('user');
      const userData = JSON.parse(userRaw);
      const userId = userData?.id || userData?.user?.id;

      // Simpan ke database
      await API.post('/api/mark-activity-complete', { scheduleId, userId });

      // Update local state
      setCompletedActivities([...completedActivities, scheduleId]);
      setNotificationData(null);

      console.log(`✅ Activity ${scheduleId} marked as complete`);
    } catch (err) {
      console.error('Error marking activity complete:', err);
      alert('Gagal menandai aktivitas. Coba lagi.');
    }
  };

  // Format waktu untuk tampilan
  const formatTime = (timeString) => {
    return timeString.substring(0, 5);
  };

  // Cek aktivitas mana yang sedang berlangsung
  const getCurrentActivity = () => {
    const currentHour = String(currentTime.getHours()).padStart(2, '0');
    const currentMinute = String(currentTime.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHour}:${currentMinute}`;

    return jadwal.find((item) => {
      const scheduleTime = item.waktu.substring(0, 5);
      return scheduleTime === currentTimeStr;
    });
  };

  const currentActivity = getCurrentActivity();
  const completedCount = completedActivities.length;
  const totalActivities = jadwal.length;

  if (loading) {
    return (
      <div className="pb-28 p-6 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#54BAB9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#54BAB9] font-semibold">Memuat jadwal...</p>
        </div>
      </div>
    );
  }

  if (jadwal.length === 0) {
    return (
      <div className="pb-28 p-6 bg-white min-h-screen">
        <h1 className="text-4xl font-bold text-[#54BAB9] mt-8 mb-2">Pengingat Hari Ini</h1>
        <div className="mt-12 p-8 text-center bg-[#F8F8F8] rounded-2xl">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 font-semibold">Belum ada jadwal yang dibuat</p>
          <p className="text-gray-400 text-sm mt-2">Silakan buat jadwal di halaman Pengaturan terlebih dahulu</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="pb-28 p-6 bg-gradient-to-br from-[#F8F9FA] to-white min-h-screen">
      {/* Header */}
      <div className="mt-8 mb-8">
        <h1 className="text-4xl font-bold text-[#54BAB9] mb-2">Pengingat Hari Ini</h1>
        <p className="text-gray-500 font-medium">
          Progres: {completedCount}/{totalActivities} aktivitas
        </p>
      </div>

      {/* Current Time Display */}
      <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-semibold mb-1">Waktu Saat Ini</p>
            <p className="text-5xl font-black text-[#54BAB9]">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <Clock size={64} className="text-[#54BAB9]/20" />
        </div>
      </div>

      {/* Notification Alert */}
      {notificationData && (
        <div className="mb-8 p-6 bg-gradient-to-r from-[#54BAB9]/10 to-[#45a8a7]/10 border-2 border-[#54BAB9] rounded-2xl animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[#54BAB9] font-black text-lg mb-1">🔔 Waktunya Aktivitas!</p>
              <h2 className="text-2xl font-black text-gray-800 mb-2">{notificationData.kegiatan}</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{notificationData.catatan}</p>
              <p className="text-[#54BAB9] font-bold mt-2">⏰ {notificationData.waktu}</p>
            </div>
            <button
              onClick={() => markAsCompleted(notificationData.id)}
              className="ml-4 px-6 py-3 bg-[#54BAB9] text-white font-bold rounded-xl hover:bg-[#45a8a7] transition-all whitespace-nowrap"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <p className="text-gray-700 font-bold">Progress Hari Ini</p>
          <p className="text-[#54BAB9] font-black text-lg">{Math.round((completedCount / totalActivities) * 100)}%</p>
        </div>
        <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#54BAB9] to-[#45a8a7] h-full transition-all duration-500 ease-out rounded-full"
            style={{ width: `${(completedCount / totalActivities) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Jadwal List */}
      <div className="space-y-3 mb-8">
        <p className="text-gray-700 font-bold px-2">Daftar Aktivitas</p>
        {jadwal.map((item) => {
          const scheduleTime = item.waktu.substring(0, 5);
          const isCompleted = completedActivities.includes(item.id);
          const isCurrent = currentActivity?.id === item.id;
          const isUpcoming =
            new Date(`2024-01-01 ${scheduleTime}`) > new Date(`2024-01-01 ${currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`);

          return (
            <div
              key={item.id}
              className={`flex items-start p-5 rounded-2xl border-2 transition-all ${
                isCompleted
                  ? 'bg-green-50 border-green-200 opacity-60'
                  : isCurrent
                  ? 'bg-[#54BAB9]/10 border-[#54BAB9] shadow-md'
                  : 'bg-white border-gray-100 hover:border-gray-300'
              }`}
            >
              <div className="mr-4 mt-1">
                {isCompleted ? (
                  <CheckCircle size={24} className="text-green-500" />
                ) : isCurrent ? (
                  <div className="w-6 h-6 border-2 border-[#54BAB9] rounded-full animate-pulse"></div>
                ) : (
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-bold text-lg ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                    {item.kegiatan}
                  </h3>
                  {isCurrent && <span className="px-2 py-1 bg-[#54BAB9] text-white text-xs font-bold rounded-full">SEDANG BERLANGSUNG</span>}
                  {isCompleted && <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">SELESAI</span>}
                </div>
                <p className={`text-sm mb-2 ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>{item.catatan}</p>
                <p className={`font-bold flex items-center gap-2 ${isCurrent ? 'text-[#54BAB9]' : 'text-gray-500'}`}>
                  <Clock size={16} /> {scheduleTime}
                </p>
              </div>

              {!isCompleted && isCurrent && (
                <button
                  onClick={() => markAsCompleted(item.id)}
                  className="ml-4 px-4 py-2 bg-[#54BAB9] text-white font-bold rounded-xl hover:bg-[#45a8a7] transition-all text-sm whitespace-nowrap"
                >
                  Tandai Selesai
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Tips Section */}
      <div className="p-6 bg-gradient-to-br from-[#54BAB9]/5 to-[#45a8a7]/5 rounded-2xl border border-[#54BAB9]/20">
        <p className="text-gray-700 text-sm leading-relaxed">
          💡 <span className="font-bold">Tips:</span> Pantau jadwal Anda dan tandai aktivitas sebagai selesai untuk melacak progres. Notifikasi akan muncul otomatis saat waktunya!
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default Pengingat;