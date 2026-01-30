import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Attempting login with:', formData);
      
      const res = await API.post('/api/auth/login', formData);
      
      console.log('Login response:', res.data);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      alert('Login berhasil!');
      navigate('/pengaturan'); 
    } catch (err) {
      console.error('Login error:', err);
      alert(err.response?.data?.msg || 'Login Gagal. Pastikan email dan password benar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center px-8 pt-20 pb-10 min-h-screen bg-[#F8F9FA] font-sans">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-black text-[#18978F] mb-2 text-center">Selamat Datang</h1>
        <p className="text-gray-500 text-center mb-12 font-medium">Masuk untuk mengelola rutinitas AI Anda</p>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block font-black text-gray-700 mb-2 ml-1">Email</label>
            <input 
              type="email" 
              placeholder="Masukkan email"
              className="w-full p-4 bg-white rounded-[20px] border-2 border-transparent outline-none focus:border-[#54BAB9] shadow-sm transition-all"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block font-black text-gray-700 mb-2 ml-1">Password</label>
            <input 
              type="password" 
              placeholder="********"
              className="w-full p-4 bg-white rounded-[20px] border-2 border-transparent outline-none focus:border-[#54BAB9] shadow-sm transition-all"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-[#54BAB9] text-white font-black py-4 rounded-[20px] text-lg shadow-lg shadow-[#54BAB9]/30 hover:bg-[#45a8a7] transition-all mt-4 ${loading ? 'opacity-70' : ''}`}
          >
            {loading ? 'Sedang Masuk...' : 'Masuk'}
          </button>
        </form>

        <p className="mt-12 text-center text-gray-500">
          Belum punya akun? <span onClick={() => navigate('/register')} className="text-[#54BAB9] font-bold cursor-pointer underline">Daftar Sekarang</span>
        </p>
      </div>
    </div>
  );
};

export default Login;