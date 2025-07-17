import React from 'react';
import styled from 'styled-components';
import RippleGridBackground from './RippleGridBackground';

const LayoutStyled = styled.div`
  display: flex;
  height: 100vh;
`;

const SidebarStyled = styled.div`
  width: 250px;
  background: rgba(11, 0, 25, 0.8);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
`;

const HeaderStyled = styled.div`
  height: 70px;
  background: rgba(11, 0, 25, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MainContentStyled = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
`;

const Sidebar: React.FC = () => {
  return <SidebarStyled>Sidebar</SidebarStyled>;
};

const Header: React.FC = () => {
  return <HeaderStyled>Header</HeaderStyled>;
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <RippleGridBackground />
      <LayoutStyled>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Header />
          <MainContentStyled>
            {children}
          </MainContentStyled>
        </div>
      </LayoutStyled>
    </>
  );
};

export default Layout;
