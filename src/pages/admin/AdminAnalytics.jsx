import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiGlobe,
  FiTrendingUp,
  FiBarChart2,
  FiUsers,
  FiPieChart,
  FiClock,
  FiChevronRight,
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import MainLayout from '@/layouts/MainLayout';
import api from '@/api/client';
import HeatmapMap from '@/components/admin/HeatmapMap';
import Loading from '@/components/Loading';
import { showToast, TOAST_TYPES } from '@/utils/toast';

const DONUT_SIZE = 140;
const DONUT_STROKE = 18;

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [heatmapRes, trendsRes, eventRes, workersRes, statusRes] = await Promise.all([
        api.get('/analytics/global-heatmap'),
        api.get('/analytics/submission-trends'),
        api.get('/analytics/event-progress'),
        api.get('/analytics/top-workers'),
        api.get('/analytics/status-breakdown'),
      ]);

      setAnalytics({
        heatmap: heatmapRes.data.data || [],
        trends: trendsRes.data.data || { monthly: [], weekly: [] },
        eventProgress: eventRes.data.data || { events: [], summary: {} },
        topWorkers: workersRes.data.data || [],
        statusBreakdown: statusRes.data.data || { submitted: 0, expired: 0, drafts: 0, total: 0 },
      });
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      const message = err.response?.data?.message || 'Failed to load analytics data';
      setError(message);
      showToast(message, TOAST_TYPES.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const renderTrendChart = (items) => {
    if (!items?.length) {
      return <p className="text-sm text-gray-500">No data available</p>;
    }

    return (
      <div className="w-full overflow-hidden rounded-2xl bg-slate-50 p-4">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={items} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis dataKey="period" tick={{ fontSize: 12 }} padding={{ left: 10, right: 10 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => [value, 'Submissions']} />
            <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderDonutChart = (values) => {
    const data = [
      { name: 'Submitted', value: values.submitted, color: '#10b981' },
      { name: 'Drafts', value: values.drafts, color: '#38bdf8' },
      { name: 'Expired', value: values.expired, color: '#f59e0b' },
    ];

    return (
      <div className="flex items-center justify-center">
        <ResponsiveContainer width={DONUT_SIZE} height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={4}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value, 'Submissions']} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Real-time analytics from submissions, events, locations, and worker activity.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-3 text-sm font-medium text-slate-800 hover:bg-slate-200"
          >
            <FiArrowLeft /> Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
          <div className="col-span-2 rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">Submission Trends</p>
                <h2 className="text-2xl font-bold text-slate-900">Monthly & weekly activity</h2>
              </div>
              <FiTrendingUp className="h-7 w-7 text-slate-500" />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Monthly submissions</p>
                {renderTrendChart(analytics.trends.monthly)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Weekly submissions</p>
                {renderTrendChart(analytics.trends.weekly)}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">Status breakdown</p>
                <h2 className="text-2xl font-bold text-slate-900" style={{ paddingBottom: '1.5rem' }}>Submission statuses</h2>
              </div>
              <FiPieChart className="h-7 w-7 text-slate-500"  />
            </div>
            {renderDonutChart(analytics.statusBreakdown)}
            <div className="mt-6 space-y-3">
              {[
                { label: 'Submitted', count: analytics.statusBreakdown.submitted, color: 'bg-emerald-500' },
                { label: 'Drafts', count: analytics.statusBreakdown.drafts, color: 'bg-sky-500' },
                { label: 'Expired', count: analytics.statusBreakdown.expired, color: 'bg-amber-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm text-slate-700">
                  <div className="flex items-center gap-3">
                    <span className={`${item.color} inline-block h-3 w-3 rounded-full`} />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
          <div className="xl:col-span-2 rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">Location heatmap</p>
                <h2 className="text-2xl font-bold text-slate-900">Activity by state & city</h2>
              </div>
              <FiGlobe className="h-7 w-7 text-slate-500" />
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl overflow-hidden border border-slate-200">
                <HeatmapMap
                  points={analytics.heatmap?.points || []}
                  center={[analytics.heatmap?.center?.lat || 20, analytics.heatmap?.center?.lng || 78]}
                  zoom={analytics.heatmap?.zoom || 4}
                />
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {analytics.heatmap?.states?.slice(0, 6).map((state) => {
                  const maxCount = analytics.heatmap?.states?.[0]?.stateCount || 1;
                  const width = Math.round((state.stateCount / maxCount) * 100);
                  return (
                    <div key={state.state} className="space-y-2 rounded-3xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                        <span>{state.state}</span>
                        <span>{state.stateCount}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-blue-600" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">Event progress</p>
                <h2 className="text-2xl font-bold text-slate-900">Event completion</h2>
              </div>
              <FiBarChart2 className="h-7 w-7 text-slate-500" />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Active events</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.eventProgress.summary.active || 0}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Expired/cancelled</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.eventProgress.summary.expired || 0}</p>
              </div>
            </div>
            <div className="space-y-4">
              {analytics.eventProgress.events.slice(0, 6).map((event) => (
                <div key={event.eventId} className="space-y-2 rounded-3xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900 truncate">{event.name}</p>
                      <p className="text-xs text-slate-500">{event.totalWorkers} workers • {event.totalForms} forms</p>
                    </div>
                    <span className="text-xs font-semibold uppercase text-slate-600">{event.completionPercentage}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${event.completionPercentage >= 80 ? 'bg-emerald-500' : event.completionPercentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(event.completionPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">Worker leaderboard</p>
                <h2 className="text-2xl font-bold text-slate-900">Top active workers</h2>
              </div>
              <FiUsers className="h-7 w-7 text-slate-500" />
            </div>
            <div className="space-y-4">
              {analytics.topWorkers.length === 0 ? (
                <p className="text-sm text-slate-500">No worker activity available</p>
              ) : (
                analytics.topWorkers.map((worker, index) => (
                  <div key={worker.workerId} className="rounded-3xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900 truncate">{worker.name || worker.email}</p>
                        <p className="text-xs text-slate-500">{worker.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">{worker.submissions}</p>
                        <p className="text-xs text-slate-500">Reports</p>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-slate-500">Latest activity: {worker.latestActivity ? new Date(worker.latestActivity).toLocaleDateString() : 'N/A'}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminAnalytics;
