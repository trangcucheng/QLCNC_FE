import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'antd/dist/reset.css';
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { RootProvider } from '@/app/RootProvider';
import ChatWidget from '@/components/ChatWidget';

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <RootProvider>
          <AuthProvider>
            <ThemeProvider>
              <SidebarProvider>
                {children}
                <ChatWidget />
              </SidebarProvider>
            </ThemeProvider>
          </AuthProvider>
        </RootProvider>
      </body>
    </html>
  );
}
