import React, { useEffect, useState } from 'react';
import API from '../api/axiosConfig';
import BottomNav from '../components/BottomNav';
import { Clock, Calendar, CheckCircle, Circle } from 'lucide-react';

const Jadwal = () => {
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedItems, setCompletedItems] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchJadwal = async () => {
      try {
        const userRaw = localStorage.getItem('user');
        if (!userRaw) {
          setError("Silakan login terlebih dahulu.");
          setLoading(false);
          return;
        }

        const userData = JSON.parse(userRaw);
        const uid = userData?.id || userData?.user?.id;
        setUserId(uid);
        
        const res = await API.get(`/api/get-jadwal/${uid}`);
        setJadwal(res.data);
        
        // Load completed activities dari database
        const completed = res.data
          .filter(item => item.is_completed === 1)
          .map(item => item.id);
        setCompletedItems(completed);
        
        console.log('📅 Jadwal loaded:', res.data.length, 'activities');
        console.log('✅ Pre-completed:', completed.length);
      } catch (err) {
        console.error("Error mengambil jadwal:", err);
        setError("Gagal memuat jadwal dari server.");
      } finally {
        setLoading(false);
      }
    };

    fetchJadwal();
  }, []);

  const toggleComplete = async (scheduleId) => {
    try {
      // Update database
      await API.post('/api/mark-activity-complete', { scheduleId, userId });
      
      // Update local state
      setCompletedItems(prev => 
        prev.includes(scheduleId) ? prev.filter(item => item !== scheduleId) : [...prev, scheduleId]
      );
      
      console.log(`✅ Activity ${scheduleId} toggled`);
    } catch (err) {
      console.error('Error toggling activity:', err);
      alert('Gagal menyimpan aktivitas. Coba lagi.');
    }
  };

  if (loading) return (
    <div className="max-w-md mx-auto min-h-screen bg-gradient-to-br from-[#F8F9FA] to-[#E9F8F8] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#54BAB9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-[#54BAB9] font-semibold">Menyusun harimu...</div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="max-w-md mx-auto min-h-screen bg-white flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <div className="text-gray-800 font-bold mb-2">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-[#54BAB9] text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-[#45a8a7] transition-all"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );

  const completionPercentage = jadwal.length > 0 ? (completedItems.length / jadwal.length) * 100 : 0;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gradient-to-br from-[#F8F9FA] to-[#E9F8F8] relative">
      {/* Header dengan Progress */}
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-b-[30px] shadow-sm sticky top-0 z-20">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#54BAB9]">Jadwal Harian</h2>
            <div className="flex items-center text-gray-500 text-sm mt-1">
              <Calendar size={14} className="mr-1" />
              Hari Ini
            </div>
          </div>
          <div className="bg-[#54BAB9]/10 h-16 w-16 rounded-2xl flex items-center justify-center">
            <span className="text-[#54BAB9] text-lg font-bold">
              {completedItems.length}/{jadwal.length}
            </span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-[#54BAB9] to-[#45a8a7] h-full transition-all duration-500 ease-out" 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {completionPercentage.toFixed(0)}% selesai
        </p>
      </div>

      {/* Jadwal List */}
      <div className="p-6 pb-28 space-y-3">
        {jadwal.length > 0 ? (
          jadwal.map((item) => {
            const isDone = completedItems.includes(item.id);
            return (
              <div 
                key={item.id} 
                className={`group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                  isDone 
                  ? 'bg-white/50 border border-gray-200' 
                  : 'bg-white shadow-sm hover:shadow-md border border-transparent'
                }`}
              >
                {/* Time Badge */}
                <div className={`flex flex-col items-center justify-center min-w-[70px] py-3 rounded-xl transition-all ${
                  isDone ? 'bg-gray-100 text-gray-400' : 'bg-[#54BAB9]/10 text-[#54BAB9]'
                }`}>
                  <Clock size={12} className="mb-1 opacity-70" />
                  <span className="font-bold text-sm">
                    {item.waktu ? item.waktu.substring(0, 5) : '00:00'}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-gray-800 transition-all ${
                    isDone ? 'line-through opacity-50' : ''
                  }`}>
                    {item.kegiatan}
                  </h3>
                  <p className={`text-sm mt-1 ${isDone ? 'text-gray-400' : 'text-gray-500'}`}>
                    {item.catatan || 'Fokus dan semangat!'}
                  </p>
                </div>

                {/* Check Button */}
                <button 
                  onClick={() => toggleComplete(item.id)}
                  className={`text-2xl transition-all duration-300 ${
                    isDone ? 'text-[#54BAB9]' : 'text-gray-300 hover:text-[#54BAB9]'
                  }`}
                >
                  {isDone ? <CheckCircle /> : <Circle />}
                </button>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-white/80 rounded-3xl border-2 border-dashed border-gray-200">
            <div className="text-5xl mb-4">📅</div>
            <p className="text-gray-600 font-semibold mb-2">Belum ada jadwal</p>
            <p className="text-gray-400 text-sm px-8">
              Atur rutinitas di halaman Pengaturan untuk memulai hari yang produktif
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Jadwal;