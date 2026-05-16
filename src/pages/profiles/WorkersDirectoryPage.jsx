import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiUser, FiStar } from 'react-icons/fi';
import MainLayout from '@/layouts/MainLayout';
import useAuth from '@/hooks/useAuth';
import { getWorkersDirectory } from '@/api/profiles';
import LoadingSpinner from '@/components/Loading';
import { showToast, TOAST_TYPES } from '@/utils/toast';

const WorkersDirectoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const profileBase =
    user?.role === 'Admin' || user?.role === 'NGO_Manager'
      ? '/admin/workers'
      : '/worker/workers';

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getWorkersDirectory();
        if (res.data.success) {
          setWorkers(res.data.data);
        }
      } catch {
        showToast('Failed to load workers', TOAST_TYPES.ERROR);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = workers.filter(
    (w) =>
      w.name?.toLowerCase().includes(search.toLowerCase()) ||
      w.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner text="Loading workers..." />;

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Field Workers</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Browse profiles and performance ratings to find the right people for events.
        </p>
      </div>

      <div className="relative mb-6 max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No workers found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((worker) => (
            <button
              key={worker._id || worker.id}
              type="button"
              onClick={() => navigate(`${profileBase}/${worker._id || worker.id}`)}
              className="text-left p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                  <FiUser className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-gray-900 dark:text-white truncate">
                    {worker.name}
                    {(worker._id || worker.id)?.toString() === user?.id && (
                      <span className="ml-2 text-xs font-normal text-blue-600 dark:text-blue-400">
                        (You)
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{worker.email}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-amber-500">
                    <FiStar className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {worker.stats?.totalReviews > 0
                        ? `${worker.stats.averageRating} (${worker.stats.totalReviews} reviews)`
                        : 'No reviews yet'}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </MainLayout>
  );
};

export default WorkersDirectoryPage;
