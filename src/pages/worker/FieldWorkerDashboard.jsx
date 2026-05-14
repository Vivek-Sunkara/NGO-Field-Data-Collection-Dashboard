import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import useAuth from '@/useAuth';

const FieldWorkerDashboard = () => {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg p-8">
          <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name}! 👋</h1>
          <p className="text-green-100">
            You're logged in as a <strong>Field Worker</strong>
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Assigned Forms */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Assigned Forms</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">5</h3>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Completed</p>
                <h3 className="text-3xl font-bold text-green-600 mt-2">3</h3>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Pending</p>
                <h3 className="text-3xl font-bold text-yellow-600 mt-2">2</h3>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Completion Rate</p>
                <h3 className="text-3xl font-bold text-blue-600 mt-2">60%</h3>
              </div>
              <div className="text-4xl">📈</div>
            </div>
          </div>
        </div>

        {/* Assigned Forms */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Assigned Forms</h2>
          <div className="space-y-4">
            {[
              {
                title: 'Health Assessment Form',
                status: 'Completed',
                statusColor: 'green',
                date: '2024-05-10',
              },
              {
                title: 'Community Feedback Survey',
                status: 'In Progress',
                statusColor: 'yellow',
                date: '2024-05-12',
              },
              {
                title: 'Water Quality Report',
                status: 'Pending',
                statusColor: 'red',
                date: '2024-05-15',
              },
            ].map((form, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border-b pb-4 hover:bg-gray-50 p-4 rounded transition"
              >
                <div>
                  <p className="font-semibold text-gray-800">{form.title}</p>
                  <p className="text-gray-500 text-sm">{form.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`bg-${form.statusColor}-100 text-${form.statusColor}-800 px-3 py-1 rounded-full text-sm font-semibold`}
                  >
                    {form.status}
                  </span>
                  {form.status === 'Pending' && (
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded transition">
                      Fill Form
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition">
              📝 Fill Out Form
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition">
              📊 View My Submissions
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FieldWorkerDashboard;
