import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkerLanguage } from '@/context/WorkerLanguageContext';
import { getWorkerShell } from '@/i18n/workerShell';
import {
  FiArrowLeft,
  FiMapPin,
  FiClock,
  FiBarChart2,
  FiCheckCircle,
  FiFileText,
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import MainLayout from '@/layouts/MainLayout';
import api from '@/api/client';
import HeatmapMap from '@/components/admin/HeatmapMap';
import Loading from '@/components/Loading';
import { showToast, TOAST_TYPES } from '@/utils/toast';

const WorkerAnalytics = () => {
  const { preferredLanguage } = useWorkerLanguage();
  const t = getWorkerShell(preferredLanguage);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    heatmap: { points: [], states: [], center: { lat: 20, lng: 78 }, zoom: 4 },
    timeline: { submissions: [], activeEvents: [] },
    stats: { totalReports: 0, activeEvents: 0, latestSubmission: null, draftCount: 0 },
    eventSummary: [],
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [heatmapRes, timelineRes, statsRes, summaryRes] = await Promise.all([
        api.get('/analytics/my-heatmap'),
        api.get('/analytics/my-timeline'),
        api.get('/analytics/my-stats'),
        api.get('/analytics/my-event-summary'),
      ]);

      setAnalytics({
        heatmap: heatmapRes.data.data || { points: [], states: [], center: { lat: 20, lng: 78 }, zoom: 4 },
        timeline: timelineRes.data.data || { submissions: [], activeEvents: [] },
        stats: statsRes.data.data || { totalReports: 0, activeEvents: 0, latestSubmission: null, draftCount: 0 },
        eventSummary: summaryRes.data.data || [],
      });
    } catch (err) {
      console.error('Failed to fetch worker analytics:', err);
      const message = err.response?.data?.message || 'Failed to load analytics data';
      setError(message);
      showToast(message, TOAST_TYPES.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const eventData = analytics.eventSummary.map((item) => ({
    name: item.eventName,
    submissions: item.submissionCount,
  }));

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
            <h1 className="text-3xl font-bold text-gray-900">{t.myAnalytics}</h1>
            <p className="text-gray-600 mt-2">{t.analyticsSubtitle}</p>
          </div>
          <button
            onClick={() => navigate('/worker/dashboard')}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-3 text-sm font-medium text-slate-800 hover:bg-slate-200"
          >
            <FiArrowLeft /> {t.backToDashboard}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">{t.totalReports}</p>
                <p className="text-3xl font-bold text-slate-900">{analytics.stats.totalReports}</p>
              </div>
              <FiFileText className="h-9 w-9 text-slate-500" />
            </div>
            <p className="text-sm text-slate-500">{t.allSubmittedReports}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">{t.activeEvents}</p>
                <p className="text-3xl font-bold text-slate-900">{analytics.stats.activeEvents}</p>
              </div>
              <FiMapPin className="h-9 w-9 text-slate-500" />
            </div>
            <p className="text-sm text-slate-500">{t.activeEventsSubtitle}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">{t.latestSubmissionLabel}</p>
                <p className="text-3xl font-bold text-slate-900">{analytics.stats.latestSubmission ? new Date(analytics.stats.latestSubmission).toLocaleDateString() : t.notAvailable}</p>
              </div>
              <FiClock className="h-9 w-9 text-slate-500" />
            </div>
            <p className="text-sm text-slate-500">{t.latestCompletedReport}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">{t.draftCountLabel}</p>
                <p className="text-3xl font-bold text-slate-900">{analytics.stats.draftCount}</p>
              </div>
              <FiCheckCircle className="h-9 w-9 text-slate-500" />
            </div>
            <p className="text-sm text-slate-500">{t.draftCountSubtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
          <div className="xl:col-span-2 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">{t.personalHeatmap}</p>
                <h2 className="text-2xl font-bold text-slate-900">{t.heatmapSubtitle}</h2>
              </div>
              <FiMapPin className="h-7 w-7 text-slate-500" />
            </div>
            <div className="rounded-3xl overflow-hidden border border-slate-200">
              <HeatmapMap
                points={analytics.heatmap.points || []}
                center={[analytics.heatmap.center.lat, analytics.heatmap.center.lng]}
                zoom={analytics.heatmap.zoom}
              />
            </div>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">{t.eventSummary}</p>
                <h2 className="text-2xl font-bold text-slate-900">{t.contributionsTitle}</h2>
              </div>
              <FiBarChart2 className="h-7 w-7 text-slate-500" />
            </div>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventData} margin={{ top: 20, right: 10, left: 0, bottom: 60 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                    height={80}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [value, 'Reports']} />
                  <Bar dataKey="submissions" fill="#2563eb" barSize={40} radius={[6, 6, 0, 0]}>
                    {eventData.map((entry) => (
                      <Cell key={entry.name} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">{t.activityTimeline}</p>
                <h2 className="text-2xl font-bold text-slate-900">{t.recentSubmissions}</h2>
              </div>
              <FiClock className="h-7 w-7 text-slate-500" />
            </div>
            <div className="space-y-4">
              {analytics.timeline.submissions.length === 0 ? (
                <p className="text-sm text-slate-500">{t.noSubmissionsYet}</p>
              ) : (
                analytics.timeline.submissions.map((item) => (
                  <div key={item.submissionId} className="rounded-3xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{item.formTitle}</p>
                        <p className="text-sm text-slate-500">{item.eventName} • {item.location?.city}, {item.location?.state}</p>
                      </div>
                      <span className="text-xs text-slate-500">{new Date(item.submittedAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">Status: {item.status}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">{t.assignedEventsLabel}</p>
                <h2 className="text-2xl font-bold text-slate-900">{t.latestActiveEvents}</h2>
              </div>
              <FiFileText className="h-7 w-7 text-slate-500" />
            </div>
            <div className="space-y-4">
              {analytics.timeline.activeEvents.length === 0 ? (
                <p className="text-sm text-slate-500">{t.noActiveAssignedEvents}</p>
              ) : (
                analytics.timeline.activeEvents.map((event) => (
                  <div key={event.eventId} className="rounded-3xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-slate-900">{event.name}</p>
                      <span className="text-xs text-slate-500">{new Date(event.createdAt).toLocaleDateString()}</span>
                    </div>
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

export default WorkerAnalytics;
