import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import AddButton from "@/components/AddButton";

export const metadata: Metadata = {
  title: "Reizo（レイゾー）",
  description: "冷蔵庫在庫管理・レシピ提案アプリ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col pb-24">{children}</div>
        <AddButton />
        <BottomNav />
      </body>
    </html>
  );
}
