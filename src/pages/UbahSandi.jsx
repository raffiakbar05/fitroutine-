import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const UbahSandi = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex items-center mb-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-2xl font-bold ml-2">Ubah Kata Sandi</h1>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block font-bold text-gray-700 mb-2">Kata Sandi Lama</label>
          <input type="password" placeholder="********" className="w-full p-4 bg-[#F2F2F2] rounded-2xl outline-none" />
        </div>
        <div>
          <label className="block font-bold text-gray-700 mb-2">Kata Sandi Baru</label>
          <input type="password" placeholder="********" className="w-full p-4 bg-[#F2F2F2] rounded-2xl outline-none focus:ring-2 focus:ring-[#54BAB9]" />
        </div>
        <div>
          <label className="block font-bold text-gray-700 mb-2">Konfirmasi Kata Sandi Baru</label>
          <input type="password" placeholder="********" className="w-full p-4 bg-[#F2F2F2] rounded-2xl outline-none" />
        </div>

        <button 
          onClick={() => navigate('/profile')}
          className="w-full bg-[#54BAB9] text-white font-bold py-5 rounded-2xl text-lg mt-10 shadow-lg"
        >
          Perbarui Kata Sandi
        </button>
      </div>
    </div>
  );
};

export default UbahSandi;