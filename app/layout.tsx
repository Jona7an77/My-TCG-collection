import "./globals.css";
import { Syne, Anonymous_Pro } from "next/font/google";
import StarfieldBg from "@/components/StarfieldBg";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const anonymousPro = Anonymous_Pro({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  // No variable — we apply className directly to <body> for guaranteed override
});

export const metadata = {
  title: "Jon's TCG Collection",
  description: "Trading card collection with parallax + holo foil",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={syne.variable}>
      <body className={`${anonymousPro.className} min-h-dvh bg-zinc-950 text-zinc-50 antialiased`}>
        <StarfieldBg />
        <div className="relative">
          {children}
        </div>
      </body>
    </html>
  );
}