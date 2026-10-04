import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "모아청년 | 내 조건에 맞는 청년 지원사업",
  description: "나이, 성별, 거주지로 전국 및 지역 청년정책과 주거지원 공고를 한곳에서 확인하세요.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
