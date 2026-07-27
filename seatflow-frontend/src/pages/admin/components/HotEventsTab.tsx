import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Flame } from 'lucide-react';
import eventApi from '../../../services/apis/event/event.api';

export const HotEventsTab: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', 'admin-all'],
    queryFn: async () => {
      const response = await eventApi.getEvents();
      return response.data;
    },
  });

  const handleToggleHot = async (id: number, current: boolean) => {
    await eventApi.setHot({ pathVars: { id }, body: { isHot: !current } });
    queryClient.invalidateQueries({ queryKey: ['events'] });
  };

  if (isLoading) {
    return <div className="text-sm text-slate-400">Đang tải...</div>;
  }

  return (
    <div className="space-y-3">
      {events?.map((event) => (
        <div key={event.id} className="glass-card border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 bg-slate-950">
          <div>
            <h4 className="font-bold text-white text-sm">{event.title}</h4>
            <p className="text-xs text-slate-400">{event.location} • {new Date(event.eventDate).toLocaleDateString('vi-VN')}</p>
          </div>
          <button
            onClick={() => handleToggleHot(event.id, event.isHot)}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg border text-xs font-bold transition-all ${
              event.isHot
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-rose-500/30 hover:text-rose-300'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{event.isHot ? 'Đang HOT' : 'Gắn HOT'}</span>
          </button>
        </div>
      ))}
    </div>
  );
};

export default HotEventsTab;
