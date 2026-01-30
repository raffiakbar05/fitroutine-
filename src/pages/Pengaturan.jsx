import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';

const Pengaturan = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState({
    jam_bangun: '06:00',
    jam_tidur: '22:00',
    aktivitas: []
  });

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    let updatedAktivitas = [...setupData.aktivitas];
    if (checked) {
      updatedAktivitas.push(value);
    } else {
      updatedAktivitas = updatedAktivitas.filter((item) => item !== value);
    }
    setSetupData({ ...setupData, aktivitas: updatedAktivitas });
  };

  const handleSave = async () => {
    // 1. Validasi Input
    if (setupData.aktivitas.length === 0) {
      return alert("Pilih minimal satu aktivitas!");
    }

    setLoading(true);
    try {
      // 2. Ambil data user dari localStorage
      const userRaw = localStorage.getItem('user');
      
      if (!userRaw) {
        alert("Sesi Anda berakhir. Silakan login kembali.");
        return navigate('/login');
      }

      const userData = JSON.parse(userRaw);
      
      // 3. Smart ID Detection (Mendeteksi ID meskipun strukturnya berbeda)
      const finalUserId = userData?.id || userData?.user?.id;

      if (!finalUserId) {
        console.error("Struktur data user di localStorage tidak memiliki ID:", userData);
        alert("ID User tidak ditemukan. Silakan logout lalu login kembali untuk menyegarkan data.");
        setLoading(false);
        return;
      }

      // 4. Siapkan Payload
      const payload = {
        userId: finalUserId,
        jam_bangun: setupData.jam_bangun,
        jam_tidur: setupData.jam_tidur,
        aktivitas: setupData.aktivitas.join(", ") 
      };

      console.log("Mengirim payload ke server:", payload);

      // 5. Kirim Request ke Backend
      const res = await API.post('/api/user/pengaturan', payload);
      
      if (res.data.success) {
        alert("Jadwal AI Berhasil Disusun!");
        navigate('/jadwal'); 
      }
    } catch (err) {
      console.error("Error Detail:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.msg || "Terjadi kesalahan pada koneksi server.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 flex flex-col min-h-screen bg-white">
      <h2 className="text-3xl font-bold text-[#54BAB9] mb-2">Pengaturan Rutinitas Harian</h2>
      <p className="text-gray-500 mb-8">Atur jadwal harian Anda agar lebih produktif</p>

      <div className="space-y-6">
        <div>
          <label className="block font-bold text-gray-700 mb-2">Jam Bangun Tidur</label>
          <input 
            type="time" 
            className="w-full p-4 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#54BAB9]" 
            value={setupData.jam_bangun}
            onChange={(e) => setSetupData({...setupData, jam_bangun: e.target.value})} 
          />
        </div>

        <div>
          <label className="block font-bold text-gray-700 mb-2">Jam Tidur</label>
          <input 
            type="time" 
            className="w-full p-4 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#54BAB9]" 
            value={setupData.jam_tidur}
            onChange={(e) => setSetupData({...setupData, jam_tidur: e.target.value})} 
          />
        </div>

        <div>
          <label className="block font-bold text-gray-700 mb-4">Pilih Aktivitas</label>
          <div className="grid grid-cols-1 gap-2">
            {['Belajar', 'Kerja', 'Olahraga'].map((item) => (
              <label key={item} className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all">
                <input 
                  type="checkbox" 
                  value={item}
                  className="w-5 h-5 rounded accent-[#54BAB9]" 
                  onChange={handleCheckboxChange}
                />
                <span className="ml-4 text-lg text-gray-700">{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <button 
        onClick={handleSave}
        disabled={loading}
        className={`mt-10 w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#54BAB9] text-white hover:bg-[#45a8a7]'
        }`}
      >
        {loading ? (
          <div className="flex justify-center items-center">
            <span className="animate-pulse">Menyusun Jadwal AI...</span>
          </div>
        ) : 'Simpan & Lanjutkan'}
      </button>
    </div>
  );
};

export default Pengaturan;