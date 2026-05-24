import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "포켓몬 도감",
  description: "포켓몬 검색, 타입별 필터, 스탯 비교, 배틀 시뮬레이터, 즐겨찾기",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-amber-50">{children}</body>
    </html>
  );
}
