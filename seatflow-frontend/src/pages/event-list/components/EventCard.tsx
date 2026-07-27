import React from 'react';
import { Calendar, MapPin, ArrowRight, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { IEvent } from '../../../types';

interface IEventCardProps {
  event: IEvent;
}

const formatPrice = (value: number) =>
  value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

export const EventCard: React.FC<IEventCardProps> = ({ event }) => {
  return (
    <div className="group glass-card rounded-2xl border border-slate-800 overflow-hidden hover:border-cyan-500/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col justify-between bg-slate-950 flex-shrink-0">
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
          {event.isHot && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-rose-500/90 backdrop-blur-md text-[11px] font-bold text-white flex items-center gap-1">
              <Flame className="w-3 h-3" />
              <span>HOT</span>
            </div>
          )}
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
            {event.organizerName && (
              <Link
                to={`/organizers/${event.organizerId}`}
                className="inline-block text-cyan-400 hover:text-cyan-300 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {event.organizerName}
              </Link>
            )}
          </div>

          <div className="mt-3 text-sm font-bold text-cyan-300">
            {event.minPrice === event.maxPrice
              ? formatPrice(event.minPrice)
              : `${formatPrice(event.minPrice)} - ${formatPrice(event.maxPrice)}`}
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
  );
};

export default EventCard;
