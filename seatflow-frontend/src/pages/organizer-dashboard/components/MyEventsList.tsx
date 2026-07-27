import React from 'react';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { IEvent } from '../../../types';

interface IMyEventsListProps {
  events: IEvent[];
}

export const MyEventsList: React.FC<IMyEventsListProps> = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400 text-sm glass-card border border-slate-800 rounded-2xl bg-slate-950">
        Bạn chưa có sự kiện nào. Hãy tạo sự kiện đầu tiên!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div key={event.id} className="glass-card border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 bg-slate-950">
          <div>
            <h4 className="font-bold text-white text-sm mb-1">{event.title}</h4>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-cyan-400" />{new Date(event.eventDate).toLocaleDateString('vi-VN')}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-cyan-400" />{event.location}</span>
              <span className="flex items-center gap-1"><Ticket className="w-3.5 h-3.5 text-cyan-400" />{event.availableSeats}/{event.totalSeats} ghế còn trống</span>
            </div>
          </div>
          {event.isHot && (
            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold flex-shrink-0">HOT</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default MyEventsList;
