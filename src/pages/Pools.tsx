import React from 'react';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';

const Pools: React.FC = () => {
  // TODO: Implement interaction with Raydium SDK or similar for liquidity pools
  return (
    <Layout>
      <GlassCard>
        <h1 style={{ color: 'white', textAlign: 'center' }}>Liquidity Pools</h1>
        <p style={{ color: 'white', textAlign: 'center' }}>
          Here you will be able to create and manage liquidity pools.
        </p>
      </GlassCard>
    </Layout>
  );
};

export default Pools;
