import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 border-b bg-white">
      <div className="mx-auto max-w-md">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center w-2/3">
            <div className="flex h-10 w-full items-center">
              <Image
                src="/godrej-logo.png"
                alt="Godrej Logo"
                width={200}
                height={40}
                className="h-6 w-auto"
              />
            </div>
          </div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="relative text-gray-600 hover:text-blue-600"
            >
              <BellIcon className="h-6 w-6" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                6
              </span>
            </button>
            <button
              type="button"
              className="text-gray-600 hover:text-blue-600"
            >
              <UserCircleIcon className="h-8 w-8" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
