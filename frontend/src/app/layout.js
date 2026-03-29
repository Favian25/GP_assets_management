import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sistem Pencatatan Asset — Galeria Production",
  description: "Dashboard sistem pencatatan dan manajemen aset Galeria Production",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Sidebar />
        <Navbar />
        <div className="ml-64 flex min-h-screen flex-col">
          <main className="flex-1 bg-background p-6 pt-22">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
