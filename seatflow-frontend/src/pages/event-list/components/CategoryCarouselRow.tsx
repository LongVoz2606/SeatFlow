import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ICategoryRowProps {
  label: string;
  count: number;
  categoryKey: string;
  children: React.ReactNode;
  viewAllLink: React.ReactNode;
}

export const CategoryCarouselRow: React.FC<ICategoryRowProps> = ({
  label,
  count,
  children,
  viewAllLink,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 660; // Scroll roughly 2 cards width
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="mb-12 animate-fade-in-up">
      {/* Category Header with Navigation Next/Prev Buttons */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full" />
          <span>{label}</span>
          <span className="text-xs text-purple-300/60 font-medium">({count})</span>
        </h2>

        <div className="flex items-center gap-3">
          {viewAllLink}
          {/* Material You MD3 Navigation Buttons (Pill Shapes with Tactile Press Feedback) */}
          <div className="flex items-center gap-1.5 ml-2">
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
      </div>

      {/* Clean Carousel Container - Hidden Scrollbar with Smooth Scroll */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-4 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
};
