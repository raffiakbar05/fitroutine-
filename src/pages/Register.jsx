import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nama: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/api/auth/register', formData);
      
      alert('Registrasi Berhasil! Silakan Login.');
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Registrasi Gagal, silakan coba lagi.';
      alert(errorMsg);
      console.error('Registration Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center px-8 pt-32 min-h-screen bg-white font-sans">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-[#54BAB9] mb-8 text-center">Buat akun</h1>
        
        <form onSubmit={handleRegister} className="w-full space-y-6">
          <div>
            <label className="block font-bold text-gray-800 mb-2">Nama</label>
            <input 
              type="text" 
              placeholder="Nama Lengkap" 
              className="w-full p-5 bg-[#F2F2F2] rounded-2xl outline-none focus:ring-2 focus:ring-[#54BAB9] transition-all"
              onChange={(e) => setFormData({...formData, nama: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block font-bold text-gray-800 mb-2">Email</label>
            <input 
              type="email" 
              placeholder="You@gmail.com" 
              className="w-full p-5 bg-[#F2F2F2] rounded-2xl outline-none focus:ring-2 focus:ring-[#54BAB9] transition-all"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block font-bold text-gray-800 mb-2">Password</label>
            <input 
              type="password" 
              placeholder="********" 
              className="w-full p-5 bg-[#F2F2F2] rounded-2xl outline-none focus:ring-2 focus:ring-[#54BAB9] transition-all"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-[#54BAB9] text-white font-bold py-5 rounded-2xl text-xl mt-8 shadow-lg hover:bg-[#45a8a7] transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Mendaftarkan...' : 'Daftar'}
          </button>
        </form>
        
        <p className="mt-12 text-center text-gray-500">
          Sudah punya akun? <span onClick={() => navigate('/')} className="text-[#54BAB9] font-bold cursor-pointer underline">Masuk</span>
        </p>
      </div>
    </div>
  );
};

export default Register;