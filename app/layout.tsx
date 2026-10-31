import type { Metadata } from "next";
import { vazirmatn } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "پنل مدیریت کاسه | Kaseh CRM",
  description: "سیستم مدیریت زنجیره‌ای مجموعه غذایی کاسه — شعب سوخاری، مکیان برگر، آش و حلیم و کافه‌رستوران",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
