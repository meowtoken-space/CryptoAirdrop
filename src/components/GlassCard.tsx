import React from 'react';
import styled from 'styled-components';

const GlassCardStyled = styled.div`
  background: rgba(154, 69, 252, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className }) => {
  return (
    <GlassCardStyled className={className}>
      {children}
    </GlassCardStyled>
  );
};

export default GlassCard;
