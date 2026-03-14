import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingContactBubbles from '../components/FloatingContactBubbles';

const MainLayout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <main>
        {children}
      </main>
      <Footer />
      <FloatingContactBubbles />
    </div>
  );
};

export default MainLayout;
