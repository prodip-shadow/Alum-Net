'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import Themecontroller from './Themecontroller';
import { signOut, useSession } from 'next-auth/react';

const NavLinks = () => {
  const pathname = usePathname();
  const session = useSession();
  const user = session?.data;
 
  const getpath = (path) =>
    pathname.startsWith(path) && path !== '/' || path === pathname
      ? 'bg-gray-900 text-neutral-content py-1'
      : 'text-base-content py-1';

  // Determine dashboard route based on role
  const role = user?.role || 'user';
  const dashboardHref = role === 'admin' ? '/dashboard/admin' 
                      : role === 'student' ? '/dashboard/student' 
                      : role === 'alumni' ? '/dashboard/alumni' 
                      : '/dashboard';

  return (
    <>
      <li>
        <Link href={'/'} className={getpath('/')}>
          Home
        </Link>
      </li>
      <li>
        <Link href={dashboardHref} className={getpath(dashboardHref)}>
          Dashboard
        </Link>
      </li>
    </>
  );
};

const Navbar = () => {
   const session = useSession();
  return (
    <div className="w-full bg-base-100 shadow-sm text-base-content">
      {/* h-12 দিয়ে ফিক্সড হাইট এবং !py-0 দিয়ে ডিফল্ট প্যাডিং জোরপূর্বক জিরো করা হয়েছে */}
      <div className="navbar h-12 !py-0 max-w-365 mx-auto">
        <div className="navbar-start">
          <div className="dropdown">
            <ul
              tabIndex="-1"
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
            >
              <NavLinks />
            </ul>
          </div>
          <Link className="text-base-content font-semibold" href={'/'}>
            Logo
          </Link>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-1">
            <NavLinks />
          </ul>
        </div>

        <div className="navbar-end flex items-center gap-3">
          <div className="mr-7">
            <Themecontroller />
          </div>
          {session.status === 'authenticated' ? (
            <>
              <button
                className="btn btn-sm bg-red-600 text-white min-h-8 h-8"
                onClick={() => signOut()}
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href={'/login'}
                className="btn btn-sm bg-red-600 text-white min-h-8 h-8"
              >
                Login
              </Link>

              <Link href={'/sign-up'} className="btn btn-sm min-h-8 h-8">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
