import React from 'react';
import styled from 'styled-components';

const StarBorderButtonStyled = styled.button`
  position: relative;
  background: var(--gradient-button);
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 12px 24px;
  color: white;
  font-weight: 600;
  overflow: hidden;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: -2px; left: -2px; right: -2px; bottom: -2px;
    background: linear-gradient(45deg, #9a45fc, #2ad6d0, #ffe118, #9a45fc);
    border-radius: 14px;
    z-index: -1;
    animation: rotate 3s linear infinite;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(154, 69, 252, 0.3);
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }
`;

interface StarBorderButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const StarBorderButton: React.FC<StarBorderButtonProps> = ({ children, onClick, className }) => {
  return (
    <StarBorderButtonStyled onClick={onClick} className={className}>
      {children}
    </StarBorderButtonStyled>
  );
};

export default StarBorderButton;
