import React from 'react';
import { Search } from 'lucide-react';
import { IOrganizerPublic } from '../../../types';

export interface IPriceRangeOption {
  key: string;
  label: string;
  minPrice?: number;
  maxPrice?: number;
}

export const PRICE_RANGE_OPTIONS: IPriceRangeOption[] = [
  { key: '', label: 'Tất cả mức giá' },
  { key: 'under-500k', label: 'Dưới 500.000đ', maxPrice: 500000 },
  { key: '500k-1m', label: '500.000đ - 1.000.000đ', minPrice: 500000, maxPrice: 1000000 },
  { key: '1m-2m', label: '1.000.000đ - 2.000.000đ', minPrice: 1000000, maxPrice: 2000000 },
  { key: 'above-2m', label: 'Trên 2.000.000đ', minPrice: 2000000 },
];

interface IEventFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
  locationOptions: string[];
  priceRangeKey: string;
  onPriceRangeChange: (key: string) => void;
  organizerId: string;
  onOrganizerIdChange: (value: string) => void;
  organizers: IOrganizerPublic[];
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
}

export const EventFilterBar: React.FC<IEventFilterBarProps> = ({
  search, onSearchChange,
  location, onLocationChange, locationOptions,
  priceRangeKey, onPriceRangeChange,
  organizerId, onOrganizerIdChange, organizers,
  hasActiveFilters, onResetFilters,
}) => {
  const selectClass = 'bg-slate-900 border border-slate-800 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 rounded-xl py-2.5 px-3 text-xs text-slate-100 outline-none transition-all';

  return (
    <div className="glass-card border border-slate-800 rounded-2xl p-4 mb-8 bg-slate-950">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm sự kiện..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-600 outline-none transition-all"
            />
          </div>

          <select value={location} onChange={(e) => onLocationChange(e.target.value)} className={selectClass}>
            <option value="">Tất cả địa điểm</option>
            {locationOptions.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          <select value={priceRangeKey} onChange={(e) => onPriceRangeChange(e.target.value)} className={selectClass}>
            {PRICE_RANGE_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>

          <select value={organizerId} onChange={(e) => onOrganizerIdChange(e.target.value)} className={selectClass}>
            <option value="">Tất cả nhà tổ chức</option>
            {organizers.map((org) => (
              <option key={org.id} value={org.id}>{org.organizationName}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-semibold transition-all whitespace-nowrap"
          >
            <span>Bỏ bộ lọc</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default EventFilterBar;
