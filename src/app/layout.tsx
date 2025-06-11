import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "T3 Clone",
  description: "T3 Chat Clone App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          crossOrigin="anonymous"
          src="//unpkg.com/react-scan/dist/auto.global.js"
        />
        {/* rest of your scripts go under */}
      </head>
      <body
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}
