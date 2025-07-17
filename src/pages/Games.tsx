import React from 'react';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';

const Games: React.FC = () => {
  return (
    <Layout>
      <GlassCard>
        <h1 style={{ color: 'white', textAlign: 'center' }}>Games</h1>
        <p style={{ color: 'white', textAlign: 'center' }}>
          Here you can play games to earn points.
        </p>
      </GlassCard>
    </Layout>
  );
};

export default Games;
