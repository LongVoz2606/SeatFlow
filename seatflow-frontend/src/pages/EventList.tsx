import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEvents } from '../services/api';
import { Calendar, MapPin, Ticket, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EventList: React.FC = () => {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium text-sm">Đang tải danh sách sự kiện...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 glass-card border border-rose-500/30 rounded-2xl text-center">
        <p className="text-rose-400 font-semibold mb-2">Không thể kết nối đến Backend API.</p>
        <p className="text-xs text-slate-400">Vui lòng đảm bảo `seatflow-backend` đang chạy tại port 8080.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Banner */}
      <div className="relative mb-12 p-8 sm:p-12 rounded-3xl glass-card border border-slate-800 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High-Speed Ticket Engine</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
            Đặt vé sự kiện thả ga, <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">không lo overselling</span>.
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            SeatFlow kết hợp Redis Distributed Lock (Redisson) và Optimistic Locking DB để bảo vệ trải nghiệm mua vé tức thì của bạn với zero latency.
          </p>
        </div>
      </div>

      {/* Events Grid */}
      <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
        <Ticket className="w-5 h-5 text-cyan-400" />
        <span>Sự kiện đang mở bán ({events?.length || 0})</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events?.map((event) => (
          <div
            key={event.id}
            className="group glass-card rounded-2xl border border-slate-800 overflow-hidden hover:border-cyan-500/50 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={event.bannerUrl}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-[11px] font-bold text-cyan-400">
                  {event.availableSeats} ghế trống
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-1">
                  {event.title}
                </h3>
                <p className="text-slate-400 text-xs line-clamp-2 mb-4">
                  {event.description}
                </p>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>{new Date(event.eventDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <Link
                to={`/events/${event.id}`}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
              >
                <span>Chọn Ghế Trực Quan</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
