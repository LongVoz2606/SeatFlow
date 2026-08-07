import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import { EventListPage } from './pages/event-list';
import { SearchEventsPage } from './pages/search';
import { EventDetailPage } from './pages/event-detail';
import { BookingConfirmPage } from './pages/booking-confirm';
import { LoginPage } from './pages/login';
import { ProfilePage } from './pages/profile';
import { OrganizerDashboardPage } from './pages/organizer-dashboard';
import { OrganizerProfilePage } from './pages/organizer-profile';
import { AdminPage } from './pages/admin';

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
        {/* Material 3 Tonal Surface Layout with Organic Atmospheric Blurs */}
        <div className="min-h-screen bg-[#0E0C15] text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-purple-500/30 selection:text-purple-200">
          {/* Global Material 3 Atmospheric Background Glows */}
          <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />
          <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<EventListPage />} />
              <Route path="/search" element={<SearchEventsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/bookings/:bookingCode" element={<BookingConfirmPage />} />
              <Route path="/organizers/dashboard" element={<ProtectedRoute><OrganizerDashboardPage /></ProtectedRoute>} />
              <Route path="/organizers/:id" element={<OrganizerProfilePage />} />
              <Route path="/admin" element={<ProtectedRoute requireRole="ADMIN"><AdminPage /></ProtectedRoute>} />
            </Routes>
          </main>
          <footer className="py-8 border-t border-purple-900/20 text-center text-xs text-purple-300/60 bg-[#0B0A10]/80 backdrop-blur-md">
            SeatFlow © 2026 High-Concurrency Event Booking System. Built with Material You (MD3) Design System.
          </footer>
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
