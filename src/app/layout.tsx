import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Meta-Clinician | Affordable Mental Health Care",
  description:
    "Comprehensive AI-powered mental health support combining psychiatry, psychology, and therapy in English and Arabic",
  alternates: {
    languages: {
      "en-US": "/en",
      "ar-SA": "/ar",
      // We use /ar-egy as the route while mapping to ar-EG for SEO conventions
      "ar-EG": "/ar-egy",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
