import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import { EventListPage } from './pages/event-list';
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
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<EventListPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/bookings/:bookingCode" element={<BookingConfirmPage />} />
              <Route path="/organizers/dashboard" element={<ProtectedRoute><OrganizerDashboardPage /></ProtectedRoute>} />
              <Route path="/organizers/:id" element={<OrganizerProfilePage />} />
              <Route path="/admin" element={<ProtectedRoute requireRole="ADMIN"><AdminPage /></ProtectedRoute>} />
            </Routes>
          </main>
          <footer className="py-6 border-t border-slate-900 text-center text-xs text-slate-500 bg-slate-950">
            SeatFlow © 2026 High-Concurrency Event Booking System. Built with Java 21, Spring Boot 3, React & Redisson.
          </footer>
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
