import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import eventApi from '../../../services/apis/event/event.api';
import { EventCard } from './EventCard';

export const HotEventsSection: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: hotEvents } = useQuery({
    queryKey: ['events', 'hot'],
    queryFn: async () => {
      const response = await eventApi.getEvents({ params: { hot: true } });
      return response.data;
    },
  });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 660;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!hotEvents || hotEvents.length === 0) {
    return null;
  }

  return (
    <div className="mb-12 animate-fade-in-up">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
          <span>Sự kiện HOT</span>
        </h2>

        {/* Material You MD3 Navigation Pill Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full border border-purple-500/20 bg-purple-950/40 hover:bg-purple-600/30 text-purple-200 hover:text-white transition-all duration-200 active:scale-95 shadow-sm"
            title="Xem trước đó"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full border border-purple-500/20 bg-purple-950/40 hover:bg-purple-600/30 text-purple-200 hover:text-white transition-all duration-200 active:scale-95 shadow-sm"
            title="Xem tiếp theo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-4 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {hotEvents.map((event) => (
          <div key={event.id} className="w-80 flex-shrink-0">
            <EventCard event={event} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotEventsSection;
