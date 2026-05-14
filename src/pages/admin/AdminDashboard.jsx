import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import useAuth from '@/useAuth';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
          <p className="text-blue-100">
            You're logged in as an <strong>Admin</strong>
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Forms Created */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Forms Created</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">12</h3>
              </div>
              <div className="text-4xl">📝</div>
            </div>
          </div>

          {/* Responses Received */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Responses</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">48</h3>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          {/* Active Field Workers */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Field Workers</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">8</h3>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          {/* Pending Reviews */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Pending</p>
                <h3 className="text-3xl font-bold text-yellow-600 mt-2">5</h3>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition">
              ➕ Create New Form
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition">
              👁️ View Responses
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition">
              📊 Export Data
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="font-semibold text-gray-800">Health Check Form Submitted</p>
                <p className="text-gray-500 text-sm">by John Doe</p>
              </div>
              <span className="text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="font-semibold text-gray-800">New Field Worker Added</p>
                <p className="text-gray-500 text-sm">Jane Smith joined the team</p>
              </div>
              <span className="text-gray-500">5 hours ago</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">Survey Form Created</p>
                <p className="text-gray-500 text-sm">Community feedback survey</p>
              </div>
              <span className="text-gray-500">1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
