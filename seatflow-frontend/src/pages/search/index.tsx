import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import eventApi from '../../services/apis/event/event.api';
import organizerApi from '../../services/apis/organizer/organizer.api';
import { Ticket, Sparkles, Filter } from 'lucide-react';
import { EventFilterBar, PRICE_RANGE_OPTIONS } from '../event-list/components/EventFilterBar';
import { EventCard } from '../event-list/components/EventCard';

const getCategoryTitle = (cat: string) => {
  switch (cat) {
    case 'Music': return 'Concert Ca Nhạc';
    case 'Tech & Seminar': return 'Hội Thảo & Công Nghệ';
    case 'Arts & Theater': return 'Kịch Nghệ & Triển Lãm';
    case 'Sports': return 'Giải Đấu Thể Thao';
    case 'Entertainment': return 'Lễ Hội & Giải Trí';
    default: return cat;
  }
};

export const SearchEventsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialLocation = searchParams.get('location') || '';
  const initialPrice = searchParams.get('price') || '';
  const initialOrganizer = searchParams.get('organizerId') || '';

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);
  const [priceRangeKey, setPriceRangeKey] = useState(initialPrice);
  const [organizerId, setOrganizerId] = useState(initialOrganizer);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);

  // Sync state with URL params changes
  useEffect(() => {
    setSearchInput(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || null);
    setLocation(searchParams.get('location') || '');
    setPriceRangeKey(searchParams.get('price') || '');
    setOrganizerId(searchParams.get('organizerId') || '');
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Update URL params
  const updateUrlParams = (newParams: Record<string, string | null | undefined>) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        nextParams.set(key, value);
      } else {
        nextParams.delete(key);
      }
    });
    setSearchParams(nextParams);
  };

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    updateUrlParams({ q: val || null });
  };

  const handleLocationChange = (val: string) => {
    setLocation(val);
    updateUrlParams({ location: val || null });
  };

  const handlePriceChange = (val: string) => {
    setPriceRangeKey(val);
    updateUrlParams({ price: val || null });
  };

  const handleOrganizerChange = (val: string) => {
    setOrganizerId(val);
    updateUrlParams({ organizerId: val || null });
  };

  const handleCategorySelect = (catKey: string | null) => {
    setSelectedCategory(catKey);
    updateUrlParams({ category: catKey || null });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setLocation('');
    setPriceRangeKey('');
    setOrganizerId('');
    setSelectedCategory(null);
    setSearchParams({});
  };

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

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (!selectedCategory) return events;
    return events.filter(e => e.category === selectedCategory);
  }, [events, selectedCategory]);

  const hasActiveFilters = !!(searchInput || location || priceRangeKey || organizerId || selectedCategory);

  const CATEGORIES = [
    { key: 'Music', label: 'Concert Ca Nhạc' },
    { key: 'Tech & Seminar', label: 'Hội Thảo & Công Nghệ' },
    { key: 'Arts & Theater', label: 'Kịch Nghệ & Triển Lãm' },
    { key: 'Sports', label: 'Giải Đấu Thể Thao' },
    { key: 'Entertainment', label: 'Lễ Hội & Giải Trí' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
          <Filter className="w-3.5 h-3.5" />
          <span>Hệ Thống Tìm Kiếm Sự Kiện</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Tìm kiếm & Lọc sự kiện
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Dễ dàng tìm thấy các chương trình ca nhạc, thể thao, triển lãm và hội thảo theo nhu cầu của bạn.
        </p>
      </div>

      {/* Quick Category Chips */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              !selectedCategory
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            Tất cả thể loại
          </button>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => handleCategorySelect(isActive ? null : cat.key)}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Filter Bar */}
      <EventFilterBar
        search={searchInput}
        onSearchChange={handleSearchChange}
        location={location}
        onLocationChange={handleLocationChange}
        locationOptions={locationOptions}
        priceRangeKey={priceRangeKey}
        onPriceRangeChange={handlePriceChange}
        organizerId={organizerId}
        onOrganizerIdChange={handleOrganizerChange}
        organizers={organizers ?? []}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Event Results Grid */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-cyan-400" />
            <span>Danh sách sự kiện ({filteredEvents.length})</span>
            {selectedCategory && (
              <span className="text-xs bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-normal">
                {getCategoryTitle(selectedCategory)}
              </span>
            )}
          </h2>
        </div>

        {error ? (
          <div className="p-6 glass-card border border-rose-500/30 rounded-2xl text-center bg-slate-950">
            <p className="text-rose-400 font-semibold mb-2">Không thể tải danh sách sự kiện.</p>
            <p className="text-xs text-slate-400">Vui lòng thử lại sau ít phút.</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950">
                <div className="h-48 w-full animate-shimmer" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-3/4 rounded animate-shimmer" />
                  <div className="h-3 w-full rounded animate-shimmer" />
                  <div className="h-3 w-2/3 rounded animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 border border-slate-800/80 rounded-2xl p-8">
            <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-bold text-base mb-1">Không tìm thấy sự kiện nào phù hợp</p>
            <p className="text-slate-500 text-xs mb-4">Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc.</p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-xs font-bold transition-all"
            >
              Bỏ bộ lọc tìm kiếm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => (
              <div key={event.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}>
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchEventsPage;
