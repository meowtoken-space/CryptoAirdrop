import React from 'react';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';

const Stake: React.FC = () => {
  // TODO: Implement interaction with staking smart contracts
  return (
    <Layout>
      <GlassCard>
        <h1 style={{ color: 'white', textAlign: 'center' }}>Stake MEOW Tokens</h1>
        <p style={{ color: 'white', textAlign: 'center' }}>
          Here you will be able to stake your MEOW tokens to earn rewards.
        </p>
      </GlassCard>
    </Layout>
  );
};

export default Stake;
