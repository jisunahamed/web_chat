import './globals.css';

export const metadata = {
  title: 'InmeTech – AI Chatbot SaaS Platform',
  description: 'Create AI agents, connect them to your website, and manage customer conversations.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
