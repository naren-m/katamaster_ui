import React from 'react';
import { DashboardAnalytics } from '../components/shared/DashboardAnalytics';
import { Layout } from '../components/shared/Layout';

const DashboardPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <DashboardAnalytics />
      </div>
    </Layout>
  );
};

export default DashboardPage;