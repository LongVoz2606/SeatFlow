import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/Header';
import { EventList } from './pages/EventList';
import { EventDetail } from './pages/EventDetail';
import { BookingConfirm } from './pages/BookingConfirm';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<EventList />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/bookings/:bookingCode" element={<BookingConfirm />} />
            </Routes>
          </main>
          <footer className="py-6 border-t border-slate-900 text-center text-xs text-slate-500">
            SeatFlow © 2026 High-Concurrency Event Booking System. Built with Java 21, Spring Boot 3, React & Redisson.
          </footer>
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
