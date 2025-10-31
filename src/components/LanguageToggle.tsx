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
        className="inline-flex items-center justify-center gap-2 rounded-md bg-surface px-3 py-2 text-body font-medium text-textMain border border-border hover:bg-surfaceAlt focus:outline-none focus:ring-2 focus:ring-primary"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="language-menu"
        aria-label="Change language"
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span>{currentLang.label}</span>
        <svg
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-[var(--motion-duration)] ${
            isOpen ? "rotate-180" : ""
          }`}
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
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
          <div
            id="language-menu"
            className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-surface shadow-card border border-border focus:outline-none"
            role="listbox"
            aria-label="Select language"
          >
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`flex items-center gap-3 w-full px-3 py-2 text-body ${
                    current === lang.code
                      ? "bg-primary/5 text-primary font-medium"
                      : "text-textMain hover:bg-surfaceAlt"
                  }`}
                  role="option"
                  aria-selected={current === lang.code}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.label}</span>
                  {current === lang.code && (
                    <svg
                      className="ml-auto w-4 h-4 flex-shrink-0 text-primary"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
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
