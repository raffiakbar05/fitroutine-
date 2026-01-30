import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import komponen (Pastikan huruf besar/kecil sesuai dengan nama file di folder pages)
import Login from './pages/login';         
import Register from './pages/Register';    
import Jadwal from './pages/jadwal';        
import Pengingat from './pages/Pengingat';  
import Laporan from './pages/Laporan';       
import Profile from './pages/Profile';       
import EditProfile from './pages/EditProfile';
import UbahSandi from './pages/UbahSandi';
import Pengaturan from './pages/Pengaturan';

function App() {
  return (
    <Router>
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative overflow-hidden">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jadwal" element={<Jadwal />} />
          <Route path="/pengingat" element={<Pengingat />} />
          <Route path="/laporan" element={<Laporan />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/ubah-sandi" element={<UbahSandi />} />
          <Route path="/pengaturan" element={<Pengaturan />} /> 6                       
        </Routes>
      </div>
    </Router>
  );
}

export default App;