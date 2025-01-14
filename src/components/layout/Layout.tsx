import { Header } from './Header';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-md px-4 pt-20 pb-20">
        {children}
      </main>
      <Navbar />
    </div>
  );
}
