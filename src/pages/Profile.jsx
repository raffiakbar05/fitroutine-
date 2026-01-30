import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import API from '../api/axiosConfig';
import { UserCircle } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ nama: '', email: '' });
  const [totalRutinitas, setTotalRutinitas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const userRaw = localStorage.getItem('user');
    if (userRaw) {
      const user = JSON.parse(userRaw);
      const uid = user?.id || user?.user?.id;
      setUserId(uid);
      setUserData({ nama: user.nama || 'User', email: user.email || 'user@email.com' });
      
      // Fetch total rutinitas selesai
      fetchTotalRutinitas(uid);
    }
  }, []);

  const fetchTotalRutinitas = async (uid) => {
    try {
      const res = await API.get(`/api/get-jadwal/${uid}`);
      // Hitung aktivitas yang sudah selesai (is_completed = 1)
      const completed = res.data.filter(item => item.is_completed === 1).length;
      setTotalRutinitas(completed);
      console.log('📊 Total rutinitas selesai:', completed);
    } catch (err) {
      console.error('❌ Error fetching rutinitas:', err);
      setTotalRutinitas(0);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white relative">
      <div className="p-6 pb-24 flex flex-col items-center">
        <div className="mt-12 mb-10 text-[#54BAB9]">
          <UserCircle size={140} strokeWidth={1} />
        </div>

        <div className="w-full space-y-5">
          <div className="p-5 border border-gray-200 rounded-3xl">
            <p className="text-gray-400 font-bold text-sm mb-1">Nama</p>
            <h3 className="text-2xl font-black text-gray-800">{userData.nama}</h3>
          </div>

          <div className="p-5 border border-gray-200 rounded-3xl">
            <p className="text-gray-400 font-bold text-sm mb-1">Email</p>
            <h3 className="text-xl font-bold text-gray-800">{userData.email}</h3>
          </div>

          <div className="p-8 bg-gradient-to-br from-[#54BAB9]/10 to-[#45a8a7]/10 border-2 border-[#54BAB9] rounded-[35px]">
            <p className="text-gray-800 font-bold text-lg mb-2">Total Rutinitas Selesai</p>
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 border-2 border-[#54BAB9] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <h2 className="text-6xl font-black text-[#54BAB9]">{totalRutinitas}</h2>
                <p className="text-sm text-gray-500 mt-2">aktivitas yang telah diselesaikan</p>
              </>
            )}
          </div>

          <div className="pt-6 space-y-4 font-sans">
            <button 
              onClick={() => navigate('/edit-profile')}
              className="w-full py-5 bg-[#F2F2F2] font-black rounded-2xl text-lg hover:bg-gray-200 transition"
            >
              Edit Profil
            </button>

            <button 
              onClick={() => navigate('/ubah-sandi')}
              className="w-full py-5 bg-[#F2F2F2] font-black rounded-2xl text-lg hover:bg-gray-200 transition"
            >
              Ubah Kata Sandi
            </button>

            <button 
              onClick={handleLogout}
              className="w-full py-5 bg-[#FFC5C5] text-[#FF4D4D] font-black rounded-2xl text-lg shadow-sm active:scale-95 transition"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;