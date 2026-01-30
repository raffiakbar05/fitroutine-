import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Bell, BarChart3, User } from 'lucide-react'; 

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menus = [
    { name: 'Jadwal', icon: <Calendar size={28} />, path: '/jadwal' },
    { name: 'Pengingat', icon: <Bell size={28} />, path: '/pengingat' },
    { name: 'Laporan', icon: <BarChart3 size={28} />, path: '/laporan' },
    { name: 'Profile', icon: <User size={28} />, path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 flex justify-around py-4 z-50">
      {menus.map((menu) => (
        <button
          key={menu.name}
          onClick={() => navigate(menu.path)}
          className={`flex flex-col items-center space-y-1 transition-all ${
            location.pathname === menu.path ? 'text-[#54BAB9]' : 'text-gray-400'
          }`}
        >
          {menu.icon}
          <span className="text-[10px] font-bold">{menu.name}</span>
        </button>
      ))}
    </div>
  );
};

export default BottomNav;