import type { Metadata } from "next";
import "./globals.css";
import RQProvider from "@/lib/react-query";

export const metadata: Metadata = {
  title: "Kanban Workspace",
  description: "Lightweight Kanban pet project: SSR landing + CSR app shell",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <RQProvider>{children}</RQProvider>
      </body>
    </html>
  );
}
