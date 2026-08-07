import React, { useState, useEffect } from 'react';
import { Ticket, LogOut, User, PlusCircle, ShieldCheck, Search } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 group-hover:rotate-6 transition-transform duration-300">
            <Ticket className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="hidden sm:block">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
              SeatFlow
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-cyan-400">
              High-Concurrency Ticket Engine
            </span>
          </div>
        </Link>

        {/* Header TicketBox-style Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Bạn tìm gì hôm nay? (VD: Rap Việt, Concert, Thể thao...)"
            className="w-full bg-slate-900/90 border-b-2 border-b-slate-700 border-x-0 border-t-0 focus:border-b-cyan-400 rounded-t-xl py-2 pl-4 pr-24 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all duration-200"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs rounded-full flex items-center gap-1 transition-all duration-200 active:scale-95 shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tìm kiếm</span>
          </button>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {role === 'ADMIN' && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-950 transition-all duration-200 active:scale-95 shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Quản trị</span>
            </Link>
          )}

          {username ? (
            <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
              <Link to="/profile" className="flex items-center gap-1.5 text-sm font-medium text-slate-200 hover:text-cyan-400 transition-colors">
                <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                  <User className="w-4 h-4" />
                </div>
                <span className="hidden sm:inline">{username}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-rose-400 transition-all duration-200 active:scale-95"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="py-2 px-5 rounded-full border border-purple-500/30 bg-purple-600/20 hover:border-purple-400 hover:bg-purple-600/30 text-purple-200 font-bold text-xs transition-all duration-200 active:scale-95 shadow-sm"
            >
              Đăng Nhập / Đăng Ký
            </Link>
          )}
        </div>
      </div>

      {/* TicketBox-style Sub Navigation Bar for Categories (Only show on main discovery pages) */}
      {(location.pathname === '/' || location.pathname === '/search' || location.pathname.startsWith('/events')) && (
        <div className="border-t border-slate-800/80 bg-slate-950/90 text-xs font-semibold text-slate-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 overflow-x-auto h-10 scrollbar-none whitespace-nowrap">
            <Link to="/search" className="hover:text-cyan-400 transition-colors py-1 text-cyan-400 font-bold">Tất cả sự kiện</Link>
            <Link to="/search?category=Music" className="hover:text-cyan-400 transition-colors py-1">Concert Ca Nhạc</Link>
            <Link to="/search?category=Arts%20%26%20Theater" className="hover:text-cyan-400 transition-colors py-1">Sân Khấu & Nghệ Thuật</Link>
            <Link to="/search?category=Sports" className="hover:text-cyan-400 transition-colors py-1">Thể Thao</Link>
            <Link to="/search?category=Tech%20%26%20Seminar" className="hover:text-cyan-400 transition-colors py-1">Hội Thảo & Công Nghệ</Link>
            <Link to="/search?category=Entertainment" className="hover:text-cyan-400 transition-colors py-1">Lễ Hội & Giải Trí</Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
