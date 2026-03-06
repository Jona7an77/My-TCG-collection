import "./globals.css";
import StarfieldBg from "@/components/StarfieldBg";

export const metadata = {
  title: "My TCG Collection",
  description: "Trading card collection with parallax + holo foil",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-zinc-950 text-zinc-50 antialiased">
        <StarfieldBg />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}