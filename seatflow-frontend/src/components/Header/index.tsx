import React, { useState, useEffect, useRef } from 'react';
import { Ticket, LogOut, User, ShieldCheck, Search, History, TrendingUp, X, Sparkles, MapPin, Calendar } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import eventApi from '../../services/apis/event/event.api';

const SEARCH_HISTORY_KEY = 'seatflow_search_history';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchContainerRef = useRef<HTMLFormElement>(null);
  
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'categories' | 'cities'>('categories');

  // Load search history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (saved) setSearchHistory(JSON.parse(saved));
    } catch (e) {
      setSearchHistory(['sao concert', 'idecaf', 'Pickleball World Cup']);
    }
  }, []);

  useEffect(() => {
    setUsername(localStorage.getItem('username'));
    setRole(localStorage.getItem('role'));
  }, [location]);

  // Click outside listener to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    setUsername(null);
    navigate('/');
  };

  // Fetch recommended hot events for search dropdown
  const { data: eventsData, isLoading: isEventsLoading } = useQuery({
    queryKey: ['events', 'search-suggestions'],
    queryFn: async () => {
      const response = await eventApi.getEvents({ params: { page: 0, size: 6 } });
      return response.data?.content || [];
    },
    enabled: isDropdownOpen,
  });

  const saveSearchTerm = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    const filtered = searchHistory.filter((item) => item.toLowerCase() !== clean.toLowerCase());
    const updated = [clean, ...filtered].slice(0, 5);
    setSearchHistory(updated);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  };

  const removeSearchHistoryItem = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const updated = searchHistory.filter((i) => i !== item);
    setSearchHistory(updated);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  };

  const handleExecuteSearch = (queryStr: string) => {
    saveSearchTerm(queryStr);
    setIsDropdownOpen(false);
    if (queryStr.trim()) {
      navigate(`/search?q=${encodeURIComponent(queryStr.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleExecuteSearch(searchQuery);
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

        {/* Interactive Search Container */}
        <form ref={searchContainerRef} onSubmit={handleSearchSubmit} className="flex-1 max-w-xl relative">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Bạn tìm gì hôm nay? (VD: Rap Việt, Concert, Thể thao...)"
              className="w-full bg-slate-900/90 border-b-2 border-b-purple-500/80 border-x-0 border-t-0 focus:border-b-purple-400 rounded-t-2xl py-2.5 pl-4 pr-24 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-4 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-full flex items-center gap-1.5 transition-all duration-200 active:scale-95 shadow-md shadow-purple-600/20"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tìm kiếm</span>
            </button>
          </div>

          {/* Material 3 Interactive Search Dropdown Drawer */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-5 shadow-2xl z-50 text-slate-200 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-900/40 animate-fade-in-up">
              {/* Search History */}
              {searchHistory.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                    <History className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Lịch sử tìm kiếm</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSearchQuery(item);
                          handleExecuteSearch(item);
                        }}
                        className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 hover:bg-purple-950/60 border border-slate-700/60 text-xs font-semibold text-slate-200 hover:text-purple-300 transition-all duration-200 active:scale-95"
                      >
                        <TrendingUp className="w-3 h-3 text-cyan-400" />
                        <span>{item}</span>
                        <X
                          className="w-3 h-3 text-slate-400 hover:text-rose-400 opacity-60 group-hover:opacity-100 transition-opacity ml-0.5"
                          onClick={(e) => removeSearchHistoryItem(e, item)}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Exploration Tabs: Categories / Cities */}
              <div className="border-t border-slate-800/80 pt-4 mb-4">
                <div className="flex gap-6 border-b border-slate-800/80 pb-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('categories')}
                    className={`text-xs font-extrabold pb-1 relative transition-colors ${
                      activeTab === 'categories' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>Khám phá theo Thể loại</span>
                    {activeTab === 'categories' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('cities')}
                    className={`text-xs font-extrabold pb-1 relative transition-colors ${
                      activeTab === 'cities' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>Khám phá theo Thành phố</span>
                    {activeTab === 'cities' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
                    )}
                  </button>
                </div>

                {activeTab === 'categories' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { name: 'Nhạc sống', category: 'Music', bg: 'from-purple-900/60 to-indigo-950/80', icon: '🎵' },
                      { name: 'Sân khấu & Nghệ thuật', category: 'Arts & Theater', bg: 'from-rose-900/60 to-pink-950/80', icon: '🎭' },
                      { name: 'Thể Thao', category: 'Sports', bg: 'from-amber-900/60 to-orange-950/80', icon: '🏀' },
                      { name: 'Hội thảo & Workshop', category: 'Tech & Seminar', bg: 'from-emerald-900/60 to-teal-950/80', icon: '💡' },
                    ].map((cat, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate(`/search?category=${encodeURIComponent(cat.category)}`);
                        }}
                        className={`cursor-pointer rounded-2xl p-3.5 bg-gradient-to-br ${cat.bg} border border-white/10 hover:border-cyan-400/50 hover:scale-[1.02] transition-all duration-200 flex items-center gap-2.5 shadow-md active:scale-95`}
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <span className="text-xs font-bold text-white line-clamp-1">{cat.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Đà Lạt'].map((city, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate(`/search?location=${encodeURIComponent(city)}`);
                        }}
                        className="cursor-pointer rounded-2xl p-3 bg-slate-800/60 border border-slate-700/60 hover:border-cyan-400/50 hover:bg-slate-800 transition-all duration-200 flex items-center gap-2 text-xs font-bold text-slate-200 active:scale-95"
                      >
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        <span>{city}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommended Hot Events Section */}
              <div className="border-t border-slate-800/80 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-white">
                    <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                    <span>Gợi ý dành cho bạn</span>
                  </div>
                  <Link
                    to="/search"
                    onClick={() => setIsDropdownOpen(false)}
                    className="text-[11px] font-bold text-cyan-400 hover:underline"
                  >
                    Xem tất cả &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {isEventsLoading ? (
                    <div className="col-span-3 py-6 flex items-center justify-center gap-2 text-xs text-purple-300 font-semibold">
                      <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      <span>Đang tải danh sách gợi ý...</span>
                    </div>
                  ) : eventsData && eventsData.length > 0 ? (
                    eventsData.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate(`/events/${event.id}`);
                        }}
                        className="cursor-pointer group rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-purple-500/50 overflow-hidden hover:scale-[1.02] transition-all duration-200 shadow-md active:scale-95"
                      >
                        <div className="h-24 w-full relative overflow-hidden bg-slate-900">
                          <img
                            src={event.bannerUrl || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=600&q=80'}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-3">
                          <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-purple-300 transition-colors">
                            {event.title}
                          </h4>
                          <div className="flex items-center justify-between mt-2 text-[10px]">
                            <span className="font-extrabold text-purple-400">
                              Từ {event.minPrice ? event.minPrice.toLocaleString('vi-VN') : 0}đ
                            </span>
                            <span className="text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              {new Date(event.eventDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 py-6 text-center text-xs text-slate-500">
                      Chưa có sự kiện gợi ý nào.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
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
