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
  // Material 3 Filled Input style: Rounded top 12px, square bottom, 2px bottom border
  const selectClass = 'bg-slate-900/90 border-b-2 border-b-slate-700 border-x-0 border-t-0 rounded-t-xl focus:border-b-violet-500 py-2.5 px-3 text-xs text-slate-100 outline-none transition-all duration-200';

  return (
    <div className="rounded-3xl border border-slate-800/80 p-5 mb-8 bg-slate-900/50 backdrop-blur-md shadow-sm">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm sự kiện..."
              className="w-full bg-slate-900/90 border-b-2 border-b-slate-700 border-x-0 border-t-0 focus:border-b-violet-500 rounded-t-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all duration-200"
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
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold transition-all duration-200 active:scale-95 whitespace-nowrap shadow-sm"
          >
            <span>Bỏ bộ lọc</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default EventFilterBar;
