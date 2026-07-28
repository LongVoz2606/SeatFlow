import React from 'react';
import { Calendar, MapPin, ArrowRight, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { IEvent } from '../../../types';

interface IEventCardProps {
  event: IEvent;
}

const formatPrice = (value: number | undefined | null) => {
  if (value === undefined || value === null) return '0 ₫';
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
};

const getCategoryBadgeLabel = (cat: string) => {
  switch (cat) {
    case 'Music': return '🎵 Nhạc Hội';
    case 'Tech & Seminar': return '💻 Hội Thảo';
    case 'Arts & Theater': return '🎭 Nghệ Thuật';
    case 'Sports': return '🏆 Thể Thao';
    case 'Entertainment': return '🎉 Giải Trí';
    default: return cat;
  }
};

export const EventCard: React.FC<IEventCardProps> = ({ event }) => {
  return (
    <div className="group glass-card rounded-2xl border border-slate-800/80 overflow-hidden hover:border-violet-500/40 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-violet-500/15 glow-purple transition-all duration-300 flex flex-col justify-between bg-slate-950/70 backdrop-blur-md flex-shrink-0 w-full">
      <div>
        {/* Banner Area */}
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

          {/* Status Badge */}
          <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full backdrop-blur-md border text-[10px] font-bold shadow-lg ${
            event.availableSeats === 0 
              ? 'bg-rose-950/80 border-rose-500/30 text-rose-400'
              : event.availableSeats <= 10
              ? 'bg-amber-950/80 border-amber-500/30 text-amber-400'
              : 'bg-emerald-950/80 border-emerald-500/30 text-emerald-400'
          }`}>
            {event.availableSeats === 0 
              ? 'Hết Vé' 
              : event.availableSeats <= 10 
              ? `Chỉ còn ${event.availableSeats} vé` 
              : 'Đang Mở Bán'}
          </div>

          {/* Hot Badge */}
          {event.isHot && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-rose-600/90 text-[10px] font-bold text-white flex items-center gap-1 shadow-lg shadow-rose-600/30 animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-white" />
              <span>TIÊU ĐIỂM</span>
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/90 backdrop-blur-md border border-slate-700/60 text-[10px] font-bold text-slate-300">
            {getCategoryBadgeLabel(event.category)}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5">
          <h3 className="text-base font-bold text-white mb-2 group-hover:text-violet-400 transition-colors line-clamp-1 leading-snug">
            {event.title}
          </h3>
          <p className="text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed min-h-[32px]">
            {event.description}
          </p>

          <div className="space-y-2.5 text-xs text-slate-300 border-t border-slate-900 pt-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-400 flex-shrink-0" />
              <span>{new Date(event.eventDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-violet-400 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
            {event.organizerName && (
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Tổ chức:</span>
                <Link
                  to={`/organizers/${event.organizerId}`}
                  className="text-violet-400 hover:text-violet-300 hover:underline truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  {event.organizerName}
                </Link>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-900 pt-3">
            <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Giá vé từ</span>
            <div className="text-sm font-black text-transparent bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text">
              {event.minPrice === event.maxPrice
                ? formatPrice(event.minPrice)
                : `${formatPrice(event.minPrice)}`}
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 pt-0">
        <Link
          to={`/events/${event.id}`}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-600/15 hover:shadow-violet-600/30 transition-all duration-300 shimmer-btn"
        >
          <span>Đặt Vé Ngay</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
