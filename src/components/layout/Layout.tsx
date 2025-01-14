import { Header } from './Header';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={title} />
      <main className="mx-auto max-w-md px-4 pt-20 pb-20">
        {children}
      </main>
      <Navbar />
    </div>
  );
}
