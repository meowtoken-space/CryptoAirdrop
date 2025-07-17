import React from 'react';
import JupiterSwap from '../components/JupiterSwap';
import SolanaWallet from '../components/SolanaWallet';
import Layout from '../components/Layout';

const Swap: React.FC = () => {
  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <SolanaWallet />
        <JupiterSwap />
      </div>
    </Layout>
  );
};

export default Swap;
