"use client";

import { useState } from "react";
import type { Language } from "@/lib/mhgap/triageEngine";

interface LanguageToggleProps {
  current: Language;
  onChange: (lang: Language) => void;
}

const languages = [
  { code: "en" as Language, label: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "ar_egy" as Language, label: "مصري", flag: "🇪🇬", dir: "rtl" },
  { code: "ar_msa" as Language, label: "عربي", flag: "🇸🇦", dir: "rtl" },
];

export default function LanguageToggle({
  current,
  onChange,
}: LanguageToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find((l) => l.code === current) || languages[0];

  const handleSelect = (lang: Language) => {
    onChange(lang);
    setIsOpen(false);

    // Update document direction for RTL languages
    const selectedLang = languages.find((l) => l.code === lang);
    if (selectedLang) {
      document.documentElement.dir = selectedLang.dir;
      document.documentElement.lang = lang.split("_")[0];
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span>{currentLang.label}</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`flex items-center gap-3 w-full px-4 py-2 text-sm ${
                    current === lang.code
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.label}</span>
                  {current === lang.code && (
                    <svg
                      className="ml-auto w-4 h-4 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
