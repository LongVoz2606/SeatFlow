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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 6;

  const initialPageSize = Number(searchParams.get('size')) || 6;
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  // Sync state with URL params changes
  useEffect(() => {
    setSearchInput(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || null);
    setLocation(searchParams.get('location') || '');
    setPriceRangeKey(searchParams.get('price') || '');
    setOrganizerId(searchParams.get('organizerId') || '');
    const p = Number(searchParams.get('page')) || 1;
    setCurrentPage(p);
    const s = Number(searchParams.get('size')) || 6;
    setPageSize(s);
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
    setCurrentPage(1);
    updateUrlParams({ q: val || null, page: null });
  };

  const handleLocationChange = (val: string) => {
    setLocation(val);
    setCurrentPage(1);
    updateUrlParams({ location: val || null, page: null });
  };

  const handlePriceChange = (val: string) => {
    setPriceRangeKey(val);
    setCurrentPage(1);
    updateUrlParams({ price: val || null, page: null });
  };

  const handleOrganizerChange = (val: string) => {
    setOrganizerId(val);
    setCurrentPage(1);
    updateUrlParams({ organizerId: val || null, page: null });
  };

  const handleCategorySelect = (catKey: string | null) => {
    setSelectedCategory(catKey);
    setCurrentPage(1);
    updateUrlParams({ category: catKey || null, page: null });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    updateUrlParams({ size: String(size), page: null });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrlParams({ page: page > 1 ? String(page) : null });
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setLocation('');
    setPriceRangeKey('');
    setOrganizerId('');
    setSelectedCategory(null);
    setCurrentPage(1);
    setPageSize(6);
    setSearchParams({});
  };

  const priceRange = useMemo(
    () => PRICE_RANGE_OPTIONS.find((opt) => opt.key === priceRangeKey),
    [priceRangeKey]
  );

  // Backend API query returning page response
  const { data: pageResponse, isLoading, error } = useQuery({
    queryKey: ['events', debouncedSearch, location, priceRangeKey, organizerId, currentPage - 1, pageSize],
    queryFn: async () => {
      const response = await eventApi.getEvents({
        params: {
          search: debouncedSearch || undefined,
          location: location || undefined,
          minPrice: priceRange?.minPrice,
          maxPrice: priceRange?.maxPrice,
          organizerId: organizerId ? Number(organizerId) : undefined,
          page: currentPage - 1,
          size: pageSize,
        },
      });
      return response.data;
    },
  });

  const { data: allEventsResponse } = useQuery({
    queryKey: ['events', 'all-for-filters'],
    queryFn: async () => {
      const response = await eventApi.getEvents({ params: { size: 100 } });
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
    () => Array.from(new Set((allEventsResponse?.content ?? []).map((e) => e.location))),
    [allEventsResponse]
  );

  const rawEvents = pageResponse?.content ?? [];
  const totalElements = pageResponse?.totalElements ?? 0;
  const totalPages = pageResponse?.totalPages ?? 1;

  const filteredEvents = useMemo(() => {
    if (!selectedCategory) return rawEvents;
    return rawEvents.filter(e => e.category === selectedCategory);
  }, [rawEvents, selectedCategory]);

  const hasActiveFilters = !!(searchInput || location || priceRangeKey || organizerId || selectedCategory);

  const CATEGORIES = [
    { key: 'Music', label: 'Concert Ca Nhạc' },
    { key: 'Tech & Seminar', label: 'Hội Thảo & Công Nghệ' },
    { key: 'Arts & Theater', label: 'Kịch Nghệ & Triển Lãm' },
    { key: 'Sports', label: 'Giải Đấu Thể Thao' },
    { key: 'Entertainment', label: 'Lễ Hội & Giải Trí' }
  ];

  // Truncated pagination pages generator with ellipsis (...)
  const getPaginationPages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-3 shadow-sm">
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

      {/* Quick Category Chips (MD3 Pill Shapes with Active Press Feedback) */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`px-4 py-2 rounded-full border text-xs font-extrabold transition-all duration-200 active:scale-95 shadow-sm ${
              !selectedCategory
                ? 'bg-purple-600/90 border-purple-500 text-white shadow-purple-500/20'
                : 'border-slate-800/80 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:text-white'
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
                className={`px-4 py-2 rounded-full border text-xs font-extrabold transition-all duration-200 active:scale-95 shadow-sm ${
                  isActive
                    ? 'bg-purple-600/90 border-purple-500 text-white shadow-purple-500/20'
                    : 'border-slate-800/80 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:text-white'
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

      {/* Event Results Grid & Top Controls */}
      <div className="mt-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-purple-400" />
            <span>Danh sách sự kiện ({totalElements})</span>
            {selectedCategory && (
              <span className="text-xs bg-purple-950/80 text-purple-300 border border-purple-500/30 px-3 py-0.5 rounded-full font-medium">
                {getCategoryTitle(selectedCategory)}
              </span>
            )}
          </h2>

          <div className="flex items-center gap-4 text-xs">
            {/* Page size dropdown (6, 12, 24, 48) */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Hiển thị mỗi trang:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="bg-slate-900/90 border-b-2 border-b-purple-500/80 border-x-0 border-t-0 rounded-t-lg py-1 px-2 text-xs font-bold text-purple-300 outline-none cursor-pointer"
              >
                <option value={6}>6 sự kiện</option>
                <option value={12}>12 sự kiện</option>
                <option value={24}>24 sự kiện</option>
                <option value={48}>48 sự kiện</option>
              </select>
            </div>

            {totalPages > 1 && (
              <span className="text-purple-300/70 font-medium">
                Trang <strong className="text-white">{currentPage}</strong> / {totalPages}
              </span>
            )}
          </div>
        </div>

        {error ? (
          <div className="p-6 border border-rose-500/30 rounded-3xl text-center bg-slate-900/50 backdrop-blur-md">
            <p className="text-rose-400 font-semibold mb-2">Không thể tải danh sách sự kiện.</p>
            <p className="text-xs text-slate-400">Vui lòng thử lại sau ít phút.</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: pageSize }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-slate-800 overflow-hidden bg-slate-900/40">
                <div className="h-48 w-full animate-shimmer" />
                <div className="p-6 space-y-3">
                  <div className="h-4 w-3/4 rounded animate-shimmer" />
                  <div className="h-3 w-full rounded animate-shimmer" />
                  <div className="h-3 w-2/3 rounded animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 border border-slate-800/80 rounded-3xl p-8">
            <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-bold text-base mb-1">Không tìm thấy sự kiện nào phù hợp</p>
            <p className="text-slate-500 text-xs mb-4">Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc.</p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 text-xs font-bold transition-all duration-200 active:scale-95 shadow-sm"
            >
              Bỏ bộ lọc tìm kiếm
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => (
                <div key={event.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>

            {/* Material You MD3 Truncated Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-wrap items-center justify-center gap-2 pt-6 border-t border-purple-900/20">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-full border border-purple-500/20 bg-purple-950/40 text-purple-200 hover:text-white hover:bg-purple-600/30 text-xs font-bold transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100 shadow-sm"
                >
                  Trang trước
                </button>

                <div className="flex flex-wrap items-center gap-1.5 px-2">
                  {getPaginationPages().map((pageItem, idx) => {
                    if (pageItem === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="w-8 text-center text-slate-500 font-bold">
                          ...
                        </span>
                      );
                    }

                    const pageNum = pageItem as number;
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded-full text-xs font-extrabold transition-all duration-200 active:scale-95 flex items-center justify-center shadow-sm ${
                          isActive
                            ? 'bg-purple-600 border border-purple-500 text-white shadow-purple-500/20 scale-105'
                            : 'border border-slate-800/80 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-full border border-purple-500/20 bg-purple-950/40 text-purple-200 hover:text-white hover:bg-purple-600/30 text-xs font-bold transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100 shadow-sm"
                >
                  Trang sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchEventsPage;
