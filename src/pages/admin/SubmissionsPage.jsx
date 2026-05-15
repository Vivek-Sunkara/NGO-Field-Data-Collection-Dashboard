import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import SubmissionsViewer from '@/components/forms/SubmissionsViewer';

const SubmissionsPage = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Form Submissions</h1>
          <p className="text-gray-600">Review and manage all data collected from the field.</p>
        </div>
        
        <SubmissionsViewer />
      </div>
    </MainLayout>
  );
};

export default SubmissionsPage;
