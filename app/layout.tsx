import './globals.css';
import QueryProvider from '../components/QueryProvider';

export const metadata = {
  title: 'FakeStore — Products',
  description: 'Products listing + detail + create form',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <div className="min-h-screen bg-gray-50 text-gray-900">
            <header className="bg-white shadow-sm">
              <div className="max-w-6xl mx-auto px-4 py-4">
                <h1 className="text-xl font-semibold">FakeStore — Products</h1>
              </div>
            </header>
            <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
