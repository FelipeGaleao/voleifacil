import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { StateImporter } from "@/components/StateImporter";

const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Vôlei Match Manager",
  description: "Organize your volleyball matches with ease.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vôlei Manager",
  },
};

export const viewport = {
  themeColor: "#3B82F6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents zooming which can feel "web-like"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans`}>
        <div className="pb-16">
          <StateImporter />
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
