import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "灵枢 Lingshu · 东方智慧生活",
  description: "八字命理 · 紫微斗数 · 易经卜卦 · 姻缘合婚 — 了解自己，从东方智慧开始。",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://linshu.site",
    siteName: "灵枢 Lingshu",
    title: "灵枢 Lingshu · 东方智慧生活",
    description: "八字命理 · 紫微斗数 · 易经卜卦 · 姻缘合婚",
    images: [
      {
        url: "https://linshu.site/og-image.png",
        width: 1200,
        height: 630,
        alt: "灵枢 Lingshu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "灵枢 Lingshu · 东方智慧生活",
    description: "八字命理 · 紫微斗数 · 易经卜卦 · 姻缘合婚",
    images: ["https://linshu.site/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
