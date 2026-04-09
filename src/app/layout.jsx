import './globals.css';
import { Providers } from '@/components/Providers';
import Script from 'next/script';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  title: 'InmeTech AI Chatbot | WordPress & Website Chatbot for Businesses in Bangladesh',
  description: 'InmeTech is a powerful AI chatbot SaaS platform for businesses. Deploy intelligent chatbots on your WordPress or custom website in under 2 minutes. Free plan available. BKash & Nagad supported.',
  keywords: 'AI chatbot Bangladesh, WordPress chatbot plugin, website chatbot, AI customer support, lead generation chatbot, chatbot SaaS Bangladesh',
  alternates: {
    canonical: 'https://chatbot.inmetech.com/',
  },
  openGraph: {
    title: 'InmeTech AI Chatbot – Deploy in 2 Minutes',
    description: 'Intelligent AI chatbot for WordPress and custom websites. Free plan. BKash & Nagad payment. Bangladesh-focused SaaS.',
    url: 'https://chatbot.inmetech.com/',
    type: 'website',
    images: [
      {
        url: 'https://chatbot.inmetech.com/logo.png',
        alt: 'InmeTech AI Chatbot Logo'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InmeTech AI Chatbot – Deploy in 2 Minutes',
    description: 'Intelligent AI chatbot for WordPress and custom websites. Free plan. BKash & Nagad payment. Bangladesh-focused SaaS.',
    images: ['https://chatbot.inmetech.com/logo.png'],
  }
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
