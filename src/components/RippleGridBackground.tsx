import React from 'react';
import styled from 'styled-components';

const RippleGridBackgroundStyled = styled.div`
  position: fixed;
  inset: 0;
  z-index: -1;

  .background-gradient {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(to bottom right, rgba(154, 69, 252, 0.2), transparent, rgba(42, 214, 208, 0.2));
  }

  .grid-pattern {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 2rem 2rem;
    opacity: 0.3;
  }

  .ripple-effects {
    // Ripple effects can be implemented here using JS or CSS animations
  }
`;

const RippleGridBackground: React.FC = () => {
  return (
    <RippleGridBackgroundStyled>
      <div className="background-gradient" />
      <div className="grid-pattern" />
      <div className="ripple-effects" />
    </RippleGridBackgroundStyled>
  );
};

export default RippleGridBackground;
