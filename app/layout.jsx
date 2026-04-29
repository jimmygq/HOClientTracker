import './globals.css';

export const metadata = {
  title: 'Hire Overseas — Client Request Tracker',
  description: 'Track and manage client hiring requests',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
