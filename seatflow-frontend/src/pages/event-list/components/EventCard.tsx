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
    <div className="group rounded-3xl border border-slate-800/80 overflow-hidden hover:border-violet-500/50 hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] flex flex-col justify-between bg-slate-900/60 backdrop-blur-md flex-shrink-0 w-full relative">
      <div>
        {/* Banner Area */}
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.2,0,0,1)]"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />

          {/* Status Pill Badge */}
          <div className={`absolute top-3 right-3 px-3 py-1 rounded-full backdrop-blur-md border text-[10px] font-bold shadow-sm ${
            event.availableSeats === 0 
              ? 'bg-rose-950/80 border-rose-500/30 text-rose-300'
              : event.availableSeats <= 10
              ? 'bg-amber-950/80 border-amber-500/30 text-amber-300'
              : 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300'
          }`}>
            {event.availableSeats === 0 
              ? 'Hết Vé' 
              : event.availableSeats <= 10 
              ? `Chỉ còn ${event.availableSeats} vé` 
              : 'Đang Mở Bán'}
          </div>

          {/* Hot Pill Badge */}
          {event.isHot && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-extrabold text-amber-300 flex items-center gap-1.5 shadow-sm animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>TIÊU ĐIỂM</span>
            </div>
          )}

          {/* Category Pill Badge */}
          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-[10px] font-bold text-slate-300">
            {getCategoryBadgeLabel(event.category)}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <h3 className="text-base font-bold text-white mb-2 group-hover:text-violet-300 transition-colors line-clamp-1 leading-snug">
            {event.title}
          </h3>
          <p className="text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed min-h-[32px]">
            {event.description}
          </p>

          <div className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
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
                  className="text-violet-400 hover:text-violet-300 hover:underline truncate font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  {event.organizerName}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Area - Pill CTA Button with tactile active:scale-95 */}
      <div className="px-6 pb-6 pt-2 border-t border-slate-800/40 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">Giá vé từ</span>
          <span className="text-sm font-black text-transparent bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text">
            {formatPrice(event.minPrice)}
          </span>
        </div>

        <Link
          to={`/events/${event.id}`}
          className="px-4 py-2 rounded-full bg-violet-600/90 hover:bg-violet-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] active:scale-95"
        >
          <span>Xem Chi Tiết</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
