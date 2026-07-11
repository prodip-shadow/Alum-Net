import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import { CiSettings } from 'react-icons/ci';
import { FiHome } from 'react-icons/fi';

const Sidebar = () => {
  const pathname = usePathname();

  const session = useSession();
  const user = session?.data;
  console.log(user);
  
  // Determine dashboard route based on role
  const role = user?.role || 'student';
  const dashboardHref = role === 'admin' ? '/dashboard/admin' 
                      : role === 'student' ? '/dashboard/student' 
                      : role === 'alumni' ? '/dashboard/alumni' 
                      : '/dashboard';

  const getSidebarLinks = (userRole) => {
    switch (userRole) {
      case 'admin':
        return [
          {
            label: 'Admin Home',
            href: '/dashboard/admin',
            icon: <FiHome />,
          },
          {
            label: 'Manage Users',
            href: '/dashboard/admin/users',
            icon: <CiSettings />,
          },
          {
            label: 'System Settings',
            href: '/dashboard/admin/settings',
            icon: <CiSettings />,
          }
        ];
      case 'alumni':
        return [
          {
            label: 'Alumni Home',
            href: '/dashboard/alumni',
            icon: <FiHome />,
          },
          {
            label: 'Post a Job',
            href: '/dashboard/alumni/post-job',
            icon: <CiSettings />,
          },
          {
            label: 'Profile Settings',
            href: '/dashboard/profile-update',
            icon: <CiSettings />,
          }
        ];
      case 'student':
      default:
        return [
          {
            label: 'Student Home',
            href: '/dashboard/student',
            icon: <FiHome />,
          },
          {
            label: 'Job Circulars',
            href: '/dashboard/student/jobs',
            icon: <CiSettings />,
          },
          {
            label: 'Profile Settings',
            href: '/dashboard/profile-update',
            icon: <CiSettings />,
          }
        ];
    }
  };

  const sidebarLinks = [
    ...getSidebarLinks(role),
    {
      label: 'Back to Home',
      href: '/',
      icon: <FiHome />,
    }
  ];
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        const drawerCheckbox = document.getElementById('my-drawer-4');
        if (drawerCheckbox) {
          drawerCheckbox.checked = !drawerCheckbox.checked;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  return (
    <>
      {/* Sidebar Drawer */}
      <div className="drawer-side is-drawer-close:overflow-visible z-20">
        <label
          htmlFor="my-drawer-4"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>

        <div className="flex min-h-full flex-col items-start bg-base-100 border-r border-base-300 is-drawer-close:w-14 is-drawer-open:w-64 transition-all duration-200">
          <div className="h-16 flex items-center px-4 border-b border-base-300 w-full overflow-hidden whitespace-nowrap">
            <span className="text-base font-black tracking-wider text-base-content is-drawer-close:hidden">
              NEXT TEMPLATE
            </span>
            <span className="text-sm font-black text-primary is-drawer-open:hidden mx-auto">
              NT
            </span>
          </div>

          <ul className="menu w-full grow p-1 pt-6 gap-1 rounded-none">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`is-drawer-close:tooltip is-drawer-close:tooltip-right  flex items-center py-3
                      ${isActive ? 'bg-base-300 rounded-sm font-semibold' : 'hover:bg-base-200  text-base-content'}
                    `}
                    data-tip={link.label}
                  >
                    {link.icon}
                    <span className="is-drawer-close:hidden ml-2">
                      {link.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {/* Profile Section */}
          <div className="w-full p-4 is-drawer-close:p-2.5 border-t border-base-300 bg-base-100 flex items-center justify-between is-drawer-close:justify-center overflow-hidden transition-all duration-200">
            <div className="flex items-center gap-3">
                <Link href={'/dashboard/profile-update'}>
              <div className="avatar shrink-0">
                  <div className="w-9 h-9 rounded-full ring-1 ring-base-300">
                    <Image
                      src={
                        user?.user?.image ||
                        'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'
                      }
                      alt="User Profile"
                      width={1080}
                      height={1080}
                    />
                  </div>
              </div>
                </Link>

              <div className="flex flex-col min-w-0 transition-all duration-200 is-drawer-close:opacity-0 is-drawer-close:w-0 is-drawer-close:pointer-events-none overflow-hidden">
                <span className="text-sm font-semibold text-base-content truncate">
                  {user?.user?.name}
                </span>
                <span className="text-xs text-base-content/60 truncate">
                  {user?.role}
                </span>
              </div>
            </div>

            <Link href={'/dashboard/profile-update'}>
              <button className="btn btn-ghost btn-circle btn-sm flex-shrink-0 transition-all duration-200 is-drawer-close:opacity-0 is-drawer-close:w-0 is-drawer-close:pointer-events-none overflow-hidden">
                <CiSettings className="text-xl" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
