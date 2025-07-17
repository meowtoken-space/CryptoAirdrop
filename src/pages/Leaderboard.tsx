import React from 'react';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';

const Leaderboard: React.FC = () => {
  return (
    <Layout>
      <GlassCard>
        <h1 style={{ color: 'white', textAlign: 'center' }}>Leaderboard</h1>
        <p style={{ color: 'white', textAlign: 'center' }}>
          See the top players in the MEOW Token ecosystem.
        </p>
      </GlassCard>
    </Layout>
  );
};

export default Leaderboard;
