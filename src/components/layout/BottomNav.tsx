'use client';

import { HomeIcon, Square3Stack3DIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Start',
      href: '/',
      icon: HomeIcon,
    },
    {
      name: 'Applications',
      href: '/apps',
      icon: Square3Stack3DIcon,
    },
    {
      name: 'To Do',
      href: '/todo',
      icon: ClipboardDocumentListIcon,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t bg-white">
      <div className="mx-auto max-w-md">
        <div className="grid h-16 grid-cols-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center space-y-1 ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <item.icon className="h-6 w-6" />
                <span className={`text-xs ${isActive ? 'font-medium' : ''}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
