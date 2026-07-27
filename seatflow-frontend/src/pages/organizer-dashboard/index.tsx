import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Clock, XCircle } from 'lucide-react';
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

  // APPROVED
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">{organizer.organizationName}</h1>
          <p className="text-xs text-slate-400">Trang quản lý sự kiện của nhà tổ chức</p>
        </div>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo sự kiện mới</span>
          </button>
        )}
      </div>

      {showCreateForm && (
        <CreateEventForm
          onCancel={() => setShowCreateForm(false)}
          onSubmit={async (body) => {
            await eventApi.createEvent({ body });
            await queryClient.invalidateQueries({ queryKey: ['events', 'mine'] });
            await queryClient.invalidateQueries({ queryKey: ['events'] });
            setShowCreateForm(false);
          }}
        />
      )}

      <h2 className="text-lg font-bold text-slate-100 mb-4">Sự kiện của tôi ({myEvents?.length ?? 0})</h2>
      <MyEventsList events={myEvents ?? []} />
    </div>
  );
};

export default OrganizerDashboardPage;
