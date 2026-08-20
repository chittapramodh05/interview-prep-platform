import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MockMaster | AI-Powered Interview Coach & Career Assistant',
  description: 'Accelerate your career preparation with real-time AI mock interviews, PDF resume parser, ATS optimization checks, and automated coding practice.',
  keywords: 'interview prep, AI mock interview, ATS resume optimizer, code practice, career helper, mock interviews, developer interview',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col antialiased bg-[#030712] text-gray-100 font-sans selection:bg-[#8b5cf6] selection:text-white">
        {children}
      </body>
    </html>
  );
}
