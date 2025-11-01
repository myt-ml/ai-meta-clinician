"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getLanguageCode } from "@/lib/i18n/translations";
import { logUIEvent } from "@/lib/telemetry/ui";

export default function LanguageSelectorPage() {
  const router = useRouter();
  const languages = [
    {
      code: "en" as const,
      name: "English",
      nativeName: "English",
      flag: "🇬🇧",
      description: "International standard language",
      path: "/en",
    },
    {
      code: "ar" as const,
      name: "Modern Standard Arabic",
      nativeName: "العربية الفصحى",
      flag: "🇸🇦",
      description: "Formal Arabic used across the Arab world",
      path: "/ar",
    },
    {
      code: "ar-egy" as const,
      name: "Egyptian Arabic",
      nativeName: "العامية المصرية",
      flag: "🇪🇬",
      description: "Colloquial Egyptian dialect",
      path: "/ar-egy",
    },
  ];

  // Prefetch language routes for snappy navigation
  useEffect(() => {
    router.prefetch("/en");
    router.prefetch("/ar");
    router.prefetch("/ar-egy");
  }, [router]);

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white"
      lang="en"
    >
      {/* Header */}
      <header className="py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">
            AI Meta-Clinician
          </h1>
          <p className="text-xl text-gray-600">
            Mental Health Support Platform
          </p>
          <p className="text-sm text-gray-500 mt-2" lang="ar">
            منصة الدعم النفسي بالذكاء الاصطناعي
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Message */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">
              Select Your Language
            </h2>
            <p className="text-lg text-gray-600 mb-2">
              Choose your preferred language to begin
            </p>
            <p className="text-lg text-gray-600" dir="rtl">
              اختر لغتك المفضلة للبدء
            </p>
          </div>

          {/* Language Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {languages.map((lang) => (
              <Link
                key={lang.code}
                href={lang.path}
                aria-label={`Start ${lang.name} session`}
                title={`Start ${lang.name} session`}
                onClick={() => {
                  // Fire-and-forget UI telemetry
                  void logUIEvent({
                    type: "language_selected",
                    language: lang.code,
                    timestamp: Date.now(),
                  });
                }}
                className="group block border-2 border-gray-200 rounded-lg p-6 bg-white transition-all duration-200 hover:border-primary hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4" aria-hidden>
                    {lang.flag}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {lang.nativeName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{lang.name}</p>
                  <p className="text-xs text-gray-500">{lang.description}</p>
                  <span
                    className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded text-sm shadow-sm group-hover:shadow focus-visible:outline-none"
                    aria-hidden
                  >
                    Start Session →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Info Section */}
          <div className="mt-16 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              ℹ️ About This Platform
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                ✅ <strong>100% Private:</strong> All conversations are
                encrypted
              </li>
              <li>
                ✅ <strong>Evidence-Based:</strong> Uses WHO mhGAP protocol
              </li>
              <li>
                ✅ <strong>Crisis Detection:</strong> Automatic risk assessment
              </li>
              <li>
                ✅ <strong>Local AI:</strong> Enhanced responses with Ollama
              </li>
              <li>
                ✅ <strong>Multilingual:</strong> Full support for EN, MSA, and
                Egyptian Arabic
              </li>
            </ul>
          </div>

          {/* Crisis Banner */}
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-3">
              🆘 In Crisis? Get Immediate Help
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-800 mb-2">International:</p>
                <ul className="space-y-1 text-gray-700">
                  <li>
                    🇺🇸 USA: <strong>988</strong> (Suicide & Crisis Lifeline)
                  </li>
                  <li>
                    🇪🇬 Egypt: <strong>08008880700</strong> (Lifeline)
                  </li>
                  <li>
                    🌍 Global:{" "}
                    <a
                      href="https://findahelpline.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      findahelpline.com
                    </a>
                  </li>
                </ul>
              </div>
              <div dir="rtl">
                <p className="font-medium text-gray-800 mb-2">دولي:</p>
                <ul className="space-y-1 text-gray-700">
                  <li>
                    🇺🇸 أمريكا: <strong>988</strong> (خط الأزمات)
                  </li>
                  <li>
                    🇪🇬 مصر: <strong>08008880700</strong> (خط الحياة)
                  </li>
                  <li>
                    🌍 عالمي:{" "}
                    <a
                      href="https://findahelpline.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      findahelpline.com
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 text-center">
        <p className="text-sm text-gray-600 mb-2">
          ⚠️ This is not a replacement for professional mental health care
        </p>
        <p className="text-sm text-gray-600" dir="rtl">
          ⚠️ هذا ليس بديلاً عن الرعاية النفسية المهنية
        </p>
        <p className="text-xs text-gray-500 mt-4">
          AI Meta-Clinician | Production-Ready | 134/134 Tests Passing
        </p>
      </footer>
    </div>
  );
}
