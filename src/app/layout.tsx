import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "灵枢 Lingshu · 东方智慧生活",
  description: "八字命理 · 紫微斗数 · 风水堪舆 · 姻缘测算 · 塔罗占卜 · 中医养生 · 禅修静心",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
