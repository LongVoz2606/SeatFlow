import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Flame } from 'lucide-react';
import eventApi from '../../../services/apis/event/event.api';
import { EventCard } from './EventCard';

export const HotEventsSection: React.FC = () => {
  const { data: hotEvents } = useQuery({
    queryKey: ['events', 'hot'],
    queryFn: async () => {
      const response = await eventApi.getEvents({ params: { hot: true } });
      return response.data;
    },
  });

  if (!hotEvents || hotEvents.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
        <Flame className="w-5 h-5 text-rose-400" />
        <span>Sự kiện HOT</span>
      </h2>
      <div className="flex gap-6 overflow-x-auto pb-2">
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
