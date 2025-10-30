import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Meta-Clinician | Affordable Mental Health Care",
  description:
    "Comprehensive AI-powered mental health support combining psychiatry, psychology, and therapy in English and Arabic",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
