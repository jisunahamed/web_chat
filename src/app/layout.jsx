import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata = {
  title: 'InmeTech – Premium AI Chatbot SaaS',
  description: 'Boost your business with smart AI agents. Setup in minutes.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
