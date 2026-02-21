import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "CoWhiteboard",
  description:
    "Real-time collaborative whiteboard for brainstorming, wireframing, and visual thinking. Built with tldraw.",
  keywords: ["whiteboard", "collaboration", "brainstorming", "tldraw", "real-time"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>

        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
