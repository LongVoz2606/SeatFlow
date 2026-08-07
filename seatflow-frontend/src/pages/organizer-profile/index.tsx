import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, Mail } from 'lucide-react';
import organizerApi from '../../services/apis/organizer/organizer.api';
import eventApi from '../../services/apis/event/event.api';
import { EventCard } from '../event-list/components/EventCard';

export const OrganizerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const organizerId = Number(id);

  const { data: organizer, isLoading, error } = useQuery({
    queryKey: ['organizer', organizerId],
    queryFn: async () => {
      const response = await organizerApi.getPublicById({ pathVars: { id: organizerId } });
      return response.data;
    },
  });

  const { data: events } = useQuery({
    queryKey: ['events', 'by-organizer', organizerId],
    queryFn: async () => {
      const response = await eventApi.getEvents({ params: { organizerId, size: 100 } });
      return response.data?.content ?? [];
    },
    enabled: !!organizer,
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !organizer) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 glass-card border border-rose-500/30 rounded-2xl text-center bg-slate-950">
        <p className="text-rose-400 font-semibold">Không tìm thấy nhà tổ chức này.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in-up">
      <div className="glass-card border border-slate-800 rounded-3xl p-8 mb-10 bg-slate-950 flex items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {organizer.logoUrl ? (
            <img src={organizer.logoUrl} alt={organizer.organizationName} className="w-full h-full object-cover" />
          ) : (
            <Building2 className="w-8 h-8 text-cyan-400" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-black text-white mb-1">{organizer.organizationName}</h1>
          {organizer.description && <p className="text-sm text-slate-400 mb-2">{organizer.description}</p>}
          <div className="flex items-center gap-1.5 text-xs text-cyan-400">
            <Mail className="w-3.5 h-3.5" />
            <span>{organizer.contactEmail}</span>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-100 mb-6">Sự kiện của {organizer.organizationName} ({events?.length ?? 0})</h2>
      {events && events.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">Nhà tổ chức này chưa có sự kiện nào.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events?.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizerProfilePage;
