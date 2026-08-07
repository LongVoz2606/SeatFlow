import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import eventApi from '../../services/apis/event/event.api';
import { 
  Sparkles, Flame, Music, Terminal, Drama, 
  Trophy, PartyPopper, Zap, ShieldCheck, Layers, ArrowRight, Calendar, MapPin
} from 'lucide-react';
import { HotEventsSection } from './components/HotEventsSection';
import { EventCard } from './components/EventCard';
import { CategoryCarouselRow } from './components/CategoryCarouselRow';
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
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events', 'home-list'],
    queryFn: async () => {
      const response = await eventApi.getEvents();
      return response.data;
    },
  });

  const featuredEvent = useMemo(() => {
    if (!events || events.length === 0) return null;
    const hot = events.find(e => e.isHot);
    return hot || events[0];
  }, [events]);

  const CATEGORIES = [
    { key: 'Music', label: 'Concert Ca Nhạc', icon: Music },
    { key: 'Tech & Seminar', label: 'Hội Thảo & Công Nghệ', icon: Terminal },
    { key: 'Arts & Theater', label: 'Kịch Nghệ & Triển Lãm', icon: Drama },
    { key: 'Sports', label: 'Giải Đấu Thể Thao', icon: Trophy },
    { key: 'Entertainment', label: 'Lễ Hội & Giải Trí', icon: PartyPopper }
  ];

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
      
      {/* Immersive Spotlight Hero Banner (MD3 Organic 48px Container & Atmospheric Blurs) */}
      {featuredEvent ? (
        <div className="relative mb-12 p-8 sm:p-12 rounded-[48px] border border-slate-800/80 overflow-hidden bg-slate-900/60 backdrop-blur-md animate-fade-in-up flex flex-col md:flex-row items-center justify-between gap-8 min-h-[360px] shadow-xl shadow-violet-500/5">
          {/* Layered Organic Atmospheric Blurs (MD3 Signature) */}
          <div className="absolute -top-12 -left-12 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl -z-10 pointer-events-none" />
          <div className="absolute -bottom-16 right-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl -z-10 pointer-events-none" />

          {/* Cover gradient overlay */}
          <div 
            className="absolute right-0 top-0 h-full w-full md:w-2/3 bg-cover bg-center opacity-25 md:opacity-40 -z-10 pointer-events-none transition-all duration-700"
            style={{ 
              backgroundImage: `url(${featuredEvent.bannerUrl})`,
              maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)'
            }} 
          />

          <div className="max-w-xl space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider animate-pulse shadow-sm">
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
              <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-1.5 rounded-full border border-slate-800 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-violet-400" />
                <span>{new Date(featuredEvent.eventDate).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-1.5 rounded-full border border-slate-800 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-violet-400" />
                <span className="truncate max-w-[150px]">{featuredEvent.location}</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-5">
              <Link
                to={`/events/${featuredEvent.id}`}
                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-violet-600/20 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] active:scale-95"
              >
                <span>Đặt Vé Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="text-xs text-slate-400">
                Vé chỉ từ <span className="text-base font-black text-transparent bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text">{formatPrice(featuredEvent.minPrice)}</span>
              </div>
            </div>
          </div>

          {/* Event Card preview container on large screens - with MD3 32px Radius */}
          <div className="hidden lg:block w-80 h-52 rounded-[32px] overflow-hidden border border-slate-800/85 shadow-2xl relative transition-transform duration-500 flex-shrink-0 animate-float">
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

      <HotEventsSection />

      {/* Events Grid / Netflix Rows by Category with Next/Prev Carousel Controls */}
      <div className="mt-12 space-y-12">
        {CATEGORIES.map((cat) => {
          const eventsInCategory = (events ?? []).filter((e) => e.category === cat.key);
          if (eventsInCategory.length === 0) return null;

          return (
            <CategoryCarouselRow
              key={cat.key}
              categoryKey={cat.key}
              label={cat.label}
              count={eventsInCategory.length}
              viewAllLink={
                <Link
                  to={`/search?category=${encodeURIComponent(cat.key)}`}
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                >
                  <span>Xem tất cả</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            >
              {eventsInCategory.map((event) => (
                <div key={event.id} className="w-80 flex-shrink-0">
                  <EventCard event={event} />
                </div>
              ))}
            </CategoryCarouselRow>
          );
        })}
      </div>
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
