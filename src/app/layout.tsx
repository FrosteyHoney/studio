import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-provider';
import { Header } from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'CommittedBodiesApp | Fitness & Meal Planning',
  description: 'Join CommittedBodiesApp, your all-in-one hub for achieving fitness goals with personalized meal planning, workout tracking, and progress monitoring. Your journey to a healthier lifestyle starts here.',
  keywords: 'CommittedBodiesApp, Committed Bodies, fitness, meal planning, workout tracker, health, nutrition, gym, exercise, diet plan',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background font-sans">
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
