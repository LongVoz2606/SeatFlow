import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import eventApi from '../../services/apis/event/event.api';
import organizerApi from '../../services/apis/organizer/organizer.api';
import { Ticket, Sparkles } from 'lucide-react';
import { HotEventsSection } from './components/HotEventsSection';
import { EventFilterBar, PRICE_RANGE_OPTIONS } from './components/EventFilterBar';
import { EventCard } from './components/EventCard';

export const EventListPage: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [location, setLocation] = useState('');
  const [priceRangeKey, setPriceRangeKey] = useState('');
  const [organizerId, setOrganizerId] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const priceRange = useMemo(
    () => PRICE_RANGE_OPTIONS.find((opt) => opt.key === priceRangeKey),
    [priceRangeKey]
  );

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events', debouncedSearch, location, priceRangeKey, organizerId],
    queryFn: async () => {
      const response = await eventApi.getEvents({
        params: {
          search: debouncedSearch || undefined,
          location: location || undefined,
          minPrice: priceRange?.minPrice,
          maxPrice: priceRange?.maxPrice,
          organizerId: organizerId ? Number(organizerId) : undefined,
        },
      });
      return response.data;
    },
  });

  const { data: allEvents } = useQuery({
    queryKey: ['events', 'all-for-filters'],
    queryFn: async () => {
      const response = await eventApi.getEvents();
      return response.data;
    },
  });

  const { data: organizers } = useQuery({
    queryKey: ['organizers', 'approved'],
    queryFn: async () => {
      const response = await organizerApi.list();
      return response.data;
    },
  });

  const locationOptions = useMemo(
    () => Array.from(new Set((allEvents ?? []).map((e) => e.location))),
    [allEvents]
  );

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
      <div className="max-w-2xl mx-auto my-12 p-6 glass-card border border-rose-500/30 rounded-2xl text-center bg-slate-950">
        <p className="text-rose-400 font-semibold mb-2">Không thể kết nối đến Backend API.</p>
        <p className="text-xs text-slate-400">Vui lòng đảm bảo các microservices đang hoạt động.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Banner */}
      <div className="relative mb-12 p-8 sm:p-12 rounded-3xl glass-card border border-slate-800 overflow-hidden bg-slate-950">
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
            Khám phá hàng loạt sự kiện nổi bật, tìm kiếm và lọc theo địa điểm, mức giá, nhà tổ chức yêu thích của bạn.
          </p>
        </div>
      </div>

      <HotEventsSection />

      <EventFilterBar
        search={searchInput}
        onSearchChange={setSearchInput}
        location={location}
        onLocationChange={setLocation}
        locationOptions={locationOptions}
        priceRangeKey={priceRangeKey}
        onPriceRangeChange={setPriceRangeKey}
        organizerId={organizerId}
        onOrganizerIdChange={setOrganizerId}
        organizers={organizers ?? []}
      />

      {/* Events Grid */}
      <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
        <Ticket className="w-5 h-5 text-cyan-400" />
        <span>Sự kiện đang mở bán ({events?.length || 0})</span>
      </h2>

      {events && events.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          Không tìm thấy sự kiện phù hợp với bộ lọc hiện tại.
        </div>
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

export default EventListPage;
