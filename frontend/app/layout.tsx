import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "CoWhiteboard",
  description:
    "Create a whiteboard, invite your friends, and collaborate together in real time.",
  keywords: ["whiteboard", "collaboration", "brainstorming", "tldraw", "real-time"],
  openGraph: {
    title: "CoWhiteboard",
    description:
      "Create a whiteboard, invite your friends, and collaborate together in real time.",
    images: [
      {
        url: "/og-image.png",
        width: 1024,
        height: 1024,
        alt: "CoWhiteboard – Real-time collaborative whiteboard",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CoWhiteboard",
    description:
      "Create a whiteboard, invite your friends, and collaborate together in real time.",
    images: ["/og-image.png"],
  },
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
