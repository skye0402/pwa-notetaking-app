'use client';

import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export function Header() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const headerContent = (
    <div className="mx-auto max-w-md">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex h-full items-center justify-start w-2/3">
          <div className="flex h-full w-full items-center py-2">
            <Image
              src="/godrej-logo.png"
              alt="Godrej Logo"
              width={200}
              height={40}
              className="h-full w-auto object-contain"
              priority
              unoptimized // Disable image optimization to ensure direct loading
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">View profile</span>
            <UserCircleIcon className="h-8 w-8" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );

  // During SSR and hydration, render a simpler version
  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-10 border-b bg-white">
        <div className="mx-auto max-w-md">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex h-full items-center justify-start w-2/3">
              <div className="flex h-full w-full items-center py-2">
                <div className="h-full w-[200px]" /> {/* Placeholder for image */}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-6 w-6" /> {/* Placeholder for bell icon */}
              <div className="h-8 w-8" /> {/* Placeholder for user icon */}
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-10 border-b bg-white">
      {headerContent}
    </header>
  );
}
