import { Inter } from "next/font/google";
import "./globals.css";
import SessionWrapper from "./components/session_wrapper/session_wrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MunchLA",
  description: "ChatBot for finding restaurants in LA",
};

export default function RootLayout({ children }) {
  return (
    <SessionWrapper>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </SessionWrapper>
  );
}
