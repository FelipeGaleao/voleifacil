import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { MatchProvider } from "../context/MatchContext";
import { BottomNav } from "@/components/BottomNav";

const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Vôlei Match Manager",
  description: "Organize your volleyball matches with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans`}>
        <MatchProvider>
          <div className="pb-16">
            {children}
          </div>
          <BottomNav />
        </MatchProvider>
      </body>
    </html>
  );
}
