import type { Metadata } from "next";
import "./globals.css";
import RQProvider from "@/lib/react-query";

export const metadata: Metadata = {
  title: "Kanban Workspace",
  description: "Легкий Kanban як pet-проєкт: SSR landing + CSR app shell",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        {/* React Query тільки на клієнті, але обгортаємо тут */}
        <RQProvider>{children}</RQProvider>
      </body>
    </html>
  );
}
