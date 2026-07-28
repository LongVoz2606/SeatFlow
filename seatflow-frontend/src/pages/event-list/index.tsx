import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import eventApi from '../../services/apis/event/event.api';
import organizerApi from '../../services/apis/organizer/organizer.api';
import { 
  Ticket, Sparkles, Flame, Music, Terminal, Drama, 
  Trophy, PartyPopper, Zap, ShieldCheck, Layers, ArrowRight, Calendar, MapPin
} from 'lucide-react';
import { HotEventsSection } from './components/HotEventsSection';
import { EventFilterBar, PRICE_RANGE_OPTIONS } from './components/EventFilterBar';
import { EventCard } from './components/EventCard';
import { Link } from 'react-router-dom';

const getCategoryTitle = (cat: string) => {
  switch (cat) {
    case 'Music': return 'Concert Ca Nhạc';
    case 'Tech & Seminar': return 'Hội Thảo & Công Nghệ';
    case 'Arts & Theater': return 'Kịch Nghệ & Triển Lãm';
    case 'Sports': return 'Giải Đấu Thể Thao';
    case 'Entertainment': return 'Lễ Hội & Giải Trí';
    default: return cat;
  }
};

const formatPrice = (value: number | undefined | null) => {
  if (value === undefined || value === null) return '0 ₫';
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
};

export const EventListPage: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [location, setLocation] = useState('');
  const [priceRangeKey, setPriceRangeKey] = useState('');
  const [organizerId, setOrganizerId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const priceRange = useMemo(
    () => PRICE_RANGE_OPTIONS.find((opt) => opt.key === priceRangeKey),
    [priceRangeKey]
  );

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events', debouncedSearch, location, priceRangeKey, organizerId],
    queryFn: async () => {
      const response = await eventApi.getEvents({
        params: {
          search: debouncedSearch || undefined,
          location: location || undefined,
          minPrice: priceRange?.minPrice,
          maxPrice: priceRange?.maxPrice,
          organizerId: organizerId ? Number(organizerId) : undefined,
        },
      });
      return response.data;
    },
  });

  const { data: allEvents } = useQuery({
    queryKey: ['events', 'all-for-filters'],
    queryFn: async () => {
      const response = await eventApi.getEvents();
      return response.data;
    },
  });

  const { data: organizers } = useQuery({
    queryKey: ['organizers', 'approved'],
    queryFn: async () => {
      const response = await organizerApi.list();
      return response.data;
    },
  });

  const locationOptions = useMemo(
    () => Array.from(new Set((allEvents ?? []).map((e) => e.location))),
    [allEvents]
  );

  // Local client-side filtered events by selected quick category
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (!selectedCategory) return events;
    return events.filter(e => e.category === selectedCategory);
  }, [events, selectedCategory]);

  // Find the first hot event to be spotlighted in the premium Hero Banner
  const featuredEvent = useMemo(() => {
    if (!events || events.length === 0) return null;
    const hot = events.find(e => e.isHot);
    return hot || events[0];
  }, [events]);

  const hasActiveFilters = !!(searchInput || location || priceRangeKey || organizerId || selectedCategory);

  const CATEGORIES = [
    { key: 'Music', label: 'Concert Ca Nhạc', icon: Music },
    { key: 'Tech & Seminar', label: 'Hội Thảo & Công Nghệ', icon: Terminal },
    { key: 'Arts & Theater', label: 'Kịch Nghệ & Triển Lãm', icon: Drama },
    { key: 'Sports', label: 'Giải Đấu Thể Thao', icon: Trophy },
    { key: 'Entertainment', label: 'Lễ Hội & Giải Trí', icon: PartyPopper }
  ];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950">
              <div className="h-48 w-full animate-shimmer" />
              <div className="p-5 space-y-3">
                <div className="h-4 w-3/4 rounded animate-shimmer" />
                <div className="h-3 w-full rounded animate-shimmer" />
                <div className="h-3 w-2/3 rounded animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 glass-card border border-rose-500/30 rounded-2xl text-center bg-slate-950">
        <p className="text-rose-400 font-semibold mb-2">Không thể kết nối đến Backend API.</p>
        <p className="text-xs text-slate-400">Vui lòng đảm bảo các microservices đang hoạt động.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Immersive Spotlight Hero Banner */}
      {featuredEvent ? (
        <div className="relative mb-12 p-6 sm:p-10 rounded-3xl border border-slate-800/85 overflow-hidden bg-slate-950/60 backdrop-blur-md animate-fade-in-up flex flex-col md:flex-row items-center justify-between gap-8 min-h-[340px] shadow-2xl shadow-violet-500/5">
          {/* Cover gradient overlay */}
          <div 
            className="absolute right-0 top-0 h-full w-full md:w-2/3 bg-cover bg-center opacity-25 md:opacity-40 -z-10 pointer-events-none transition-all duration-700"
            style={{ 
              backgroundImage: `url(${featuredEvent.bannerUrl})`,
              maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)'
            }} 
          />
          <div className="absolute top-0 left-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-xl space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-300 text-[10px] font-black uppercase tracking-wider animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Sự Kiện Tiêu Điểm</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight line-clamp-2">
              {featuredEvent.title}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed line-clamp-2 max-w-lg">
              {featuredEvent.description}
            </p>
            
            <div className="flex flex-wrap gap-3 text-xs text-slate-300 pt-2">
              <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-violet-400" />
                <span>{new Date(featuredEvent.eventDate).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-violet-400" />
                <span className="truncate max-w-[150px]">{featuredEvent.location}</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-5">
              <Link
                to={`/events/${featuredEvent.id}`}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-violet-600/15 hover:shadow-violet-600/30 transition-all duration-300 transform active:scale-98 shimmer-btn"
              >
                <span>Đặt Vé Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="text-xs text-slate-400">
                Vé chỉ từ <span className="text-sm font-black text-transparent bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text">{formatPrice(featuredEvent.minPrice)}</span>
              </div>
            </div>
          </div>

          {/* Event Card preview container on large screens - with 3D Float animation */}
          <div className="hidden lg:block w-80 h-48 rounded-2xl overflow-hidden border border-slate-800/85 shadow-2xl relative transition-transform duration-500 flex-shrink-0 animate-float">
            <img src={featuredEvent.bannerUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-slate-950/20" />
          </div>
        </div>
      ) : (
        <div className="relative mb-12 p-8 sm:p-12 rounded-3xl glass-card border border-slate-800 overflow-hidden bg-slate-950 animate-fade-in-up">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/80 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>High-Speed Ticket Engine</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
              Đặt vé sự kiện thả ga, <span className="bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">không lo overselling</span>.
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Khám phá hàng loạt sự kiện nổi bật, tìm kiếm và lọc theo địa điểm, mức giá, nhà tổ chức yêu thích của bạn.
            </p>
          </div>
        </div>
      )}

      {/* Quick Category Navigation Icons */}
      <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-4">Tìm kiếm nhanh theo thể loại</h3>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(isActive ? null : cat.key)}
                className={`flex items-center gap-2.5 px-4.5 py-3 rounded-xl border text-xs font-bold transition-all duration-305 ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border-violet-500 text-violet-300 shadow-lg shadow-violet-500/15 scale-98 glow-purple'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200 hover:bg-slate-950/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <HotEventsSection />

      <EventFilterBar
        search={searchInput}
        onSearchChange={setSearchInput}
        location={location}
        onLocationChange={setLocation}
        locationOptions={locationOptions}
        priceRangeKey={priceRangeKey}
        onPriceRangeChange={setPriceRangeKey}
        organizerId={organizerId}
        onOrganizerIdChange={setOrganizerId}
        organizers={organizers ?? []}
      />

      {/* Events Grid / Netflix Rows */}
      {hasActiveFilters ? (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-violet-400" />
            <span>Kết quả tìm kiếm ({filteredEvents.length})</span>
            {selectedCategory && (
              <span className="text-xs bg-violet-950 text-violet-400 border border-violet-500/30 px-2 py-0.5 rounded-full font-normal">
                Thể loại: {getCategoryTitle(selectedCategory)}
              </span>
            )}
          </h2>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              Không tìm thấy sự kiện phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => (
                <div key={event.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8 space-y-12">
          {['Music', 'Tech & Seminar', 'Arts & Theater', 'Sports', 'Entertainment'].map((cat) => {
            const eventsInCategory = (events ?? []).filter((e) => e.category === cat);
            if (eventsInCategory.length === 0) return null;

            return (
              <div key={cat} className="mb-12 animate-fade-in-up">
                <h2 className="text-lg font-bold text-slate-100 mb-5 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-gradient-to-b from-violet-400 to-indigo-500 rounded-full" />
                  <span>{getCategoryTitle(cat)}</span>
                  <span className="text-xs text-slate-500 font-normal">({eventsInCategory.length})</span>
                </h2>
                <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-slate-800 hover:scrollbar-thumb-slate-700">
                  {eventsInCategory.map((event) => (
                    <div key={event.id} className="w-80 flex-shrink-0 transition-all duration-300 hover:scale-[1.02]">
                      <EventCard event={event} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trust & Engine Performance Stats Section */}
      <div className="mt-24 border-t border-slate-900/60 pt-16 pb-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-950/20 border border-slate-900 flex gap-4 items-start hover:border-violet-500/20 transition-all duration-300">
            <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/25">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200 mb-1.5">Xử lý Giao dịch 0.05s</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sử dụng hàng đợi Kafka và cache Redis giúp giữ chỗ và hoàn tất đặt vé tức thì mà không lo nghẽn mạng.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/20 border border-slate-900 flex gap-4 items-start hover:border-violet-500/20 transition-all duration-300">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/25">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200 mb-1.5">Chống Overselling 100%</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cơ chế khóa giữ ghế tự động (Optimistic Lock) đảm bảo mỗi vị trí ngồi chỉ được thanh toán duy nhất một lần.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/20 border border-slate-900 flex gap-4 items-start hover:border-violet-500/20 transition-all duration-300">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200 mb-1.5">Sơ đồ Ghế Trực quan</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hỗ trợ sơ đồ phân vùng và trạng thái ghế VIP/Regular hiển thị tức thời theo thời gian thực (realtime live map).
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-16 text-[10px] text-slate-600 tracking-wider">
          © 2026 SeatFlow Engine. All rights reserved. Powered by Advanced Microservice Architecture.
        </div>
      </div>

    </div>
  );
};

export default EventListPage;
