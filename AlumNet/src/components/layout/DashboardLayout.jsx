'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Themecontroller from '@/components/layout/navbar/Themecontroller';
import { TbLayoutSidebarRightCollapse } from 'react-icons/tb';
import Sidebar from '@/components/layout/dashboard-sidebar/Sidebar';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  // Derive dynamic page title from the last path segment
  const segment = pathname.split('/').filter(Boolean).pop();
  let pageTitle = 'Dashboard';
  if (segment && !['dashboard', 'admin', 'student', 'alumni'].includes(segment)) {
    pageTitle = segment.charAt(0).toUpperCase() + segment.slice(1);
  } else if (segment === 'admin') {
    pageTitle = 'Admin';
  } else if (segment === 'student') {
    pageTitle = 'Student';
  } else if (segment === 'alumni') {
    pageTitle = 'Alumni';
  }

  return (
    <div className="drawer lg:drawer-open min-h-screen bg-base-200">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col">
        {/* Mobile / Desktop Navbar */}
        <nav className="navbar  bg-base-100 border-b border-base-300 h-16 flex justify-between items-center px-4">
          <div className="flex items-center">
            <label
              htmlFor="my-drawer-4"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost"
            >
              <TbLayoutSidebarRightCollapse className="text-2xl" />
            </label>
            <div className="px-4 text-xl font-bold text-base-content">
              Dashboard - {pageTitle}
            </div>
          </div>

          <div className="pr-12">
            <Themecontroller className="" />
          </div>
        </nav>

        {/* Main Dashboard Content */}
        <main className="p-6 flex-grow">
          <div className="bg-base-100 p-6 border border-base-300 min-h-[calc(100vh-120px)] rounded-none">
            {children}
          </div>
        </main>
      </div>

      <Sidebar />
    </div>
  );
}
