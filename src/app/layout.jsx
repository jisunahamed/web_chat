import './globals.css';
import { Providers } from '@/components/Providers';
import Script from 'next/script';

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
        <Script 
          src="https://chatbot.inmetech.com/widget.js"
          strategy="afterInteractive"
          data-agent-id="142a34c2-eafb-4c91-a657-d30b3da386eb"
          data-api-key="63bcf35c-9c27-4bb8-8f82-8680ae2ae85e"
        />
      </body>
    </html>
  );
}
