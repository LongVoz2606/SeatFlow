import React, { useState } from 'react';
import { ShieldCheck, UserCog, Flame, Wallet } from 'lucide-react';
import { PendingOrganizersTab } from './components/PendingOrganizersTab';
import { HotEventsTab } from './components/HotEventsTab';
import { UsersTab } from './components/UsersTab';
import { AdminBookingsTab } from './components/AdminBookingsTab';

type ETab = 'organizers' | 'hot' | 'users' | 'bookings';

const TABS: { key: ETab; label: string; icon: React.ElementType }[] = [
  { key: 'organizers', label: 'Duyệt Nhà tổ chức', icon: ShieldCheck },
  { key: 'hot', label: 'Sự kiện HOT', icon: Flame },
  { key: 'users', label: 'Người dùng', icon: UserCog },
  { key: 'bookings', label: 'Booking & Doanh thu', icon: Wallet },
];

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ETab>('organizers');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-black text-white mb-6">Trang Quản trị</h1>

      <div className="flex flex-wrap gap-2 mb-8 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 py-2 px-4 text-xs font-bold rounded-xl transition-all ${
              activeTab === key ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'organizers' && <PendingOrganizersTab />}
      {activeTab === 'hot' && <HotEventsTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'bookings' && <AdminBookingsTab />}
    </div>
  );
};

export default AdminPage;
