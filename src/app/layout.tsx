"use client"
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { Inter } from "next/font/google";
import Header from "@/components/Header";

import { AntdRegistry } from '@ant-design/nextjs-registry';

const inter = Inter({ subsets: ["latin"], weight: "400" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
