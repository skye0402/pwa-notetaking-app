import Link from 'next/link';
import { HomeIcon, QueueListIcon, FolderIcon } from '@heroicons/react/24/outline';

export function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-white">
      <div className="mx-auto max-w-md">
        <div className="flex h-16 items-center justify-around">
          <Link
            href="/"
            className="flex flex-col items-center text-gray-600 hover:text-blue-600"
          >
            <HomeIcon className="h-6 w-6" />
            <span className="mt-1 text-xs">Start</span>
          </Link>
          <Link
            href="/apps"
            className="flex flex-col items-center text-gray-600 hover:text-blue-600"
          >
            <QueueListIcon className="h-6 w-6" />
            <span className="mt-1 text-xs">Apps</span>
          </Link>
          <Link
            href="/todo"
            className="flex flex-col items-center text-gray-600 hover:text-blue-600"
          >
            <FolderIcon className="h-6 w-6" />
            <span className="mt-1 text-xs">To Do</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
