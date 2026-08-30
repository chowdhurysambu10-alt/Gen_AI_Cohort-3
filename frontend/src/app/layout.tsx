import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { CustomCursor } from '../components/CustomCursor';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Personal Gemini Journal',
  description: 'A private, authenticated, and secure personal journaling application powered by Gemini.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <body className="h-full antialiased text-slate-900 bg-slate-50 dark:text-slate-100 dark:bg-slate-950 selection:bg-indigo-500 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            <CustomCursor />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
