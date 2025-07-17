import React from 'react';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';

const Dashboard: React.FC = () => {
  return (
    <Layout>
      <GlassCard>
        <h1 style={{ color: 'white', textAlign: 'center' }}>Dashboard</h1>
        <p style={{ color: 'white', textAlign: 'center' }}>
          Welcome to your MEOW Token dashboard.
        </p>
      </GlassCard>
    </Layout>
  );
};

export default Dashboard;
