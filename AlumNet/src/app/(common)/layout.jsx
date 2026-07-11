import Footer from '@/components/layout/footer/Footer';
import Navbar from '@/components/layout/navbar/Navbar';
import React from 'react';

export default function CommonLayout({ children }) {
  return (
    <div className="flex-1 flex flex-col">
      <Navbar/>
      <main className="flex-1">{children}</main>
      <Footer/>
    </div>
  );
}
