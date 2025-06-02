import './globals.css';
import { AuthProvider } from '@/lib/context/auth-context';

export const metadata = {
  title: 'Triple eOS',
  description: 'Build adaptive, antifragile businesses with the Triple E Model',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
