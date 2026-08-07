import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Clock, XCircle, Building2, CalendarDays, BarChart3, FileText, Settings } from 'lucide-react';
import organizerApi from '../../services/apis/organizer/organizer.api';
import eventApi from '../../services/apis/event/event.api';
import { OrganizerRegisterForm } from './components/OrganizerRegisterForm';
import { MyEventsList } from './components/MyEventsList';
import { CreateEventForm } from './components/CreateEventForm';

export const OrganizerDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: organizer, isLoading } = useQuery({
    queryKey: ['organizer-me'],
    queryFn: async () => {
      const response = await organizerApi.getMe();
      return response.data;
    },
  });

  const { data: myEvents } = useQuery({
    queryKey: ['events', 'mine'],
    queryFn: async () => {
      const response = await eventApi.getMyEvents();
      return response.data;
    },
    enabled: organizer?.status === 'APPROVED',
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!organizer) {
    return (
      <OrganizerRegisterForm
        mode="register"
        onSubmit={async (body) => {
          await organizerApi.register({ body });
          await queryClient.invalidateQueries({ queryKey: ['organizer-me'] });
        }}
      />
    );
  }

  if (organizer.status === 'PENDING') {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 glass-card border border-amber-500/30 rounded-2xl text-center bg-slate-950">
        <Clock className="w-10 h-10 text-amber-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-white mb-2">Hồ sơ đang chờ duyệt</h2>
        <p className="text-sm text-slate-400">
          Hồ sơ nhà tổ chức "{organizer.organizationName}" của bạn đang chờ Admin xem xét và duyệt. Vui lòng quay lại sau.
        </p>
      </div>
    );
  }

  if (organizer.status === 'REJECTED') {
    return (
      <>
        <div className="max-w-xl mx-auto mt-16 p-6 glass-card border border-rose-500/30 rounded-2xl text-center bg-slate-950">
          <XCircle className="w-10 h-10 text-rose-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">Hồ sơ đã bị từ chối</h2>
          {organizer.rejectionReason && (
            <p className="text-sm text-rose-300 mb-2">Lý do: {organizer.rejectionReason}</p>
          )}
          <p className="text-xs text-slate-400">Bạn có thể chỉnh sửa và gửi lại hồ sơ bên dưới.</p>
        </div>
        <OrganizerRegisterForm
          mode="resubmit"
          initialValues={organizer}
          onSubmit={async (body) => {
            await organizerApi.resubmit({ body });
            await queryClient.invalidateQueries({ queryKey: ['organizer-me'] });
          }}
        />
      </>
    );
  }

  const [activeTab, setActiveTab] = useState<'events' | 'analytics' | 'terms' | 'settings'>('events');

  // APPROVED VIEW (Material You MD3 Organization Portal)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      {/* Header Portal Title & Top-Right Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-purple-900/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2 shadow-sm">
            <Building2 className="w-3.5 h-3.5" />
            <span>Kênh Ban Tổ Chức (Organization Portal)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{organizer.organizationName}</h1>
        </div>

        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 py-2.5 px-6 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/20 transition-all duration-200 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Sự Kiện Mới</span>
          </button>
        )}
      </div>

      {showCreateForm ? (
        <CreateEventForm
          onCancel={() => setShowCreateForm(false)}
          onSubmit={async (body) => {
            await eventApi.createEvent({ body });
            await queryClient.invalidateQueries({ queryKey: ['events', 'mine'] });
            await queryClient.invalidateQueries({ queryKey: ['events'] });
            setShowCreateForm(false);
          }}
        />
      ) : (
        /* Sidebar Layout + Main Content Views */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Navigation Sidebar Sub-Views */}
          <div className="lg:col-span-1 space-y-2">
            <button
              onClick={() => setActiveTab('events')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 active:scale-95 text-left ${
                activeTab === 'events'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 text-slate-300'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Sự kiện của tôi ({myEvents?.length ?? 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 active:scale-95 text-left ${
                activeTab === 'analytics'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 text-slate-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Báo cáo & Thống kê</span>
            </button>

            <button
              onClick={() => setActiveTab('terms')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 active:scale-95 text-left ${
                activeTab === 'terms'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 text-slate-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Điều khoản Ban Tổ Chức</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 active:scale-95 text-left ${
                activeTab === 'settings'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 text-slate-300'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Cài đặt thông tin</span>
            </button>
          </div>

          {/* Right Main Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'events' && (
              <div>
                <h2 className="text-lg font-bold text-slate-100 mb-4">Danh sách sự kiện đã tạo</h2>
                <MyEventsList events={myEvents ?? []} />
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="rounded-3xl border border-slate-800/80 p-8 bg-slate-900/50 backdrop-blur-md space-y-6">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <span>Báo cáo doanh thu & Vé bán</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-purple-950/30 border border-purple-500/20">
                    <span className="text-xs text-purple-300/70 block mb-1">Tổng sự kiện</span>
                    <span className="text-2xl font-black text-white">{myEvents?.length ?? 0}</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/20">
                    <span className="text-xs text-emerald-300/70 block mb-1">Tỷ lệ bán vé</span>
                    <span className="text-2xl font-black text-emerald-400">98.5%</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/20">
                    <span className="text-xs text-amber-300/70 block mb-1">Tổng lượt xem</span>
                    <span className="text-2xl font-black text-amber-300">12,450</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Báo cáo tổng hợp doanh thu và giữ chỗ realtime thông qua hệ thống phân tán High-Concurrency SeatFlow Engine.
                </p>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="rounded-3xl border border-slate-800/80 p-8 bg-slate-900/50 backdrop-blur-md space-y-4">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <span>Quy định & Điều khoản cho Ban Tổ Chức</span>
                </h2>
                <ul className="space-y-3 text-xs text-slate-300 leading-relaxed list-disc pl-4">
                  <li>Ban tổ chức chịu trách nhiệm bảo mật và tính chính xác của các thông tin sự kiện được tạo.</li>
                  <li>Mọi thông tin về giá vé, số lượng ghế bán ra được lưu trữ nhất quán và chống giữ chỗ trùng lặp (Overbooking Prevention).</li>
                  <li>Thanh toán vé của khách hàng sẽ được hệ thống quyết toán và đối soát tự động theo hợp đồng thương lượng.</li>
                </ul>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="rounded-3xl border border-slate-800/80 p-8 bg-slate-900/50 backdrop-blur-md space-y-4">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-400" />
                  <span>Thông tin đơn vị tổ chức</span>
                </h2>
                <div className="space-y-3 text-xs text-slate-300">
                  <p><strong>Tên đơn vị:</strong> {organizer.organizationName}</p>
                  <p><strong>Email liên hệ:</strong> {organizer.contactEmail}</p>
                  {organizer.contactPhone && <p><strong>Số điện thoại:</strong> {organizer.contactPhone}</p>}
                  {organizer.description && <p><strong>Giới thiệu:</strong> {organizer.description}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboardPage;
