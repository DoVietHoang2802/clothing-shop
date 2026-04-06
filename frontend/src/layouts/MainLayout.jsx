import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingContactBubbles from '../components/FloatingContactBubbles';
import ChatWidget from '../components/ChatWidget';

const MainLayout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <main>
        {children}
      </main>
      <Footer />
      <FloatingContactBubbles />
      <ChatWidget />
    </div>
  );
};

export default MainLayout;
