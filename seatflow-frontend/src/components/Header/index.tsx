import React, { useState, useEffect } from 'react';
import { Ticket, LogOut, User, PlusCircle, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setUsername(localStorage.getItem('username'));
    setRole(localStorage.getItem('role'));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    setUsername(null);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 group-hover:rotate-6 transition-transform duration-300">
            <Ticket className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
              SeatFlow
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-cyan-400">
              High-Concurrency Ticket Engine
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/organizers/dashboard"
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950 hover:scale-105 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Thêm sự kiện</span>
          </Link>

          {role === 'ADMIN' && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-950 hover:scale-105 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Quản trị</span>
            </Link>
          )}

          {username ? (
            <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
              <Link to="/profile" className="flex items-center gap-1.5 text-sm font-medium text-slate-200 hover:text-cyan-400 transition-colors">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span>{username}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-rose-400 transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="py-1.5 px-4 rounded-xl border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/30 text-cyan-400 hover:text-cyan-300 font-bold text-xs transition-all"
            >
              Đăng Nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
