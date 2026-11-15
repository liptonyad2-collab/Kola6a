import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kola6a CRM",
  description: "Управление направлениями и каталогом услуг"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
