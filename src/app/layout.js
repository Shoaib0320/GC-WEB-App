import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { LoaderProvider } from "../context/LoaderContext";
import GlobalLoader from "@/components/GlobalLoader";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Globium Clouds",
  description: "Limitless Cloud Innovations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <LoaderProvider>
            {children}
            <GlobalLoader />
          </LoaderProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
