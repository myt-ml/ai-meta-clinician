"use client";

import { useState, useEffect } from "react";
import ChatWindow, { Message } from "@/components/ChatWindow";
import VoiceInput from "@/components/VoiceInput";
import PHQForm from "@/components/PHQForm";
import SessionHistory from "@/components/SessionHistory";
import { triage } from "@/lib/mhgap/triageEngine";
import {
  initLLM,
  isLLMReady,
  generateClinicalAssessment,
  getInitStatus,
} from "@/lib/llm/webllmClient";
import { saveSession, type Session } from "@/lib/session/sessionManager";
import Link from "next/link";

export default function ArabicMSAPage() {
  const language = "ar_msa"; // Fixed to Modern Standard Arabic
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [riskAlert, setRiskAlert] = useState<{
    level: "moderate" | "high" | "critical";
    message: string;
  } | null>(null);
  const [sessionId, setSessionId] = useState<string>(
    () => `session-${Date.now()}`
  );
  const [showHistory, setShowHistory] = useState(false);
  const [llmStatus, setLlmStatus] = useState<{
    isReady: boolean;
    isInitializing: boolean;
    progress: string;
  }>({
    isReady: false,
    isInitializing: false,
    progress: "",
  });
  const [useLLM, setUseLLM] = useState(false);

  // Initialize WebLLM on mount
  useEffect(() => {
    const checkLLMStatus = () => {
      const status = getInitStatus();
      setLlmStatus({
        isReady: status.isReady,
        isInitializing: status.isInitializing,
        progress: "",
      });
    };

    checkLLMStatus();
    const interval = setInterval(checkLLMStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    setIsProcessing(true);
    const userMessage: Message = {
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    try {
      // Run triage
      const result = await triage(text, language);

      // Check for risk alerts
      if (result.riskLevel && result.riskLevel !== "low") {
        setRiskAlert({
          level: result.riskLevel as "moderate" | "high" | "critical",
          message:
            result.riskLevel === "critical"
              ? "⚠️ عاجل: تم اكتشاف أزمة. يرجى الاتصال بخدمات الطوارئ فوراً."
              : result.riskLevel === "high"
              ? "⚠️ تم اكتشاف خطر عالٍ. يُنصح بالحصول على دعم مهني قريباً."
              : "ملاحظة: تم اكتشاف بعض الأنماط المقلقة. يُفضل استشارة متخصص.",
        });
      }

      // Generate AI response
      let aiResponse = result.response;

      if (useLLM && llmStatus.isReady) {
        try {
          const llmResponse = await generateClinicalAssessment(
            text,
            result.response,
            language
          );
          aiResponse = llmResponse || result.response;
        } catch (error) {
          console.error("LLM generation failed, using fallback:", error);
        }
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Save session
      await saveSession({
        id: sessionId,
        messages: [...messages, userMessage, assistantMessage],
        language,
        startTime: new Date(),
        lastActivity: new Date(),
        riskLevel: result.riskLevel || "low",
      } as Session);
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage: Message = {
        role: "assistant",
        content:
          "أعتذر، لقد واجهت خطأ. يرجى المحاولة مرة أخرى أو الاتصال بالدعم إذا استمرت المشكلة.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceInput = (transcript: string) => {
    setInputText(transcript);
  };

  const handleNewSession = () => {
    setMessages([]);
    setSessionId(`session-${Date.now()}`);
    setRiskAlert(null);
  };

  const handleLoadSession = (session: Session) => {
    setMessages(session.messages as Message[]);
    setSessionId(session.id);
    setShowHistory(false);
    if (session.riskLevel && session.riskLevel !== "low") {
      setRiskAlert({
        level: session.riskLevel as "moderate" | "high" | "critical",
        message: "مستوى خطر الجلسة السابقة: " + session.riskLevel,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      {/* Header */}
      <header className="border-b border-subtle bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">
                الطبيب الذكي للصحة النفسية
              </h1>
              <p className="text-sm text-gray-600">
                منصة الدعم النفسي - العربية الفصحى
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="px-4 py-2 text-sm border border-subtle rounded hover:bg-subtle transition"
              >
                تغيير اللغة
              </Link>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 text-sm border border-subtle rounded hover:bg-subtle transition"
              >
                {showHistory ? "إخفاء" : "عرض"} السجل
              </button>
              <button
                onClick={handleNewSession}
                className="px-4 py-2 text-sm bg-primary text-white rounded hover:opacity-90 transition"
              >
                جلسة جديدة
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Risk Alert Banner */}
      {riskAlert && (
        <div
          className={`${
            riskAlert.level === "critical"
              ? "bg-red-50 border-red-200 text-red-800"
              : riskAlert.level === "high"
              ? "bg-orange-50 border-orange-200 text-orange-800"
              : "bg-yellow-50 border-yellow-200 text-yellow-800"
          } border-b px-4 py-3`}
        >
          <div className="container mx-auto">
            <p className="font-medium">{riskAlert.message}</p>
            {riskAlert.level === "critical" && (
              <div className="mt-2 text-sm">
                <strong>موارد الطوارئ:</strong>
                <ul className="mt-1">
                  <li>🇪🇬 مصر: 08008880700 (خط الحياة)</li>
                  <li>🌍 دولي: findahelpline.com</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 flex gap-6">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col">
          <ChatWindow
            messages={messages}
            language={language}
            isProcessing={isProcessing}
          />

          {/* Input Section */}
          <div className="mt-4 border border-subtle rounded-lg p-4 bg-white">
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => handleSendMessage(inputText)}
                disabled={isProcessing || !inputText.trim()}
                className="px-6 py-2 bg-primary text-white rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                إرسال
              </button>
              <VoiceInput
                language={language}
                onTranscript={handleVoiceInput}
                disabled={isProcessing}
              />
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(inputText);
                  }
                }}
                placeholder="اكتب رسالتك..."
                className="flex-1 px-4 py-2 border border-subtle rounded focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isProcessing}
              />
            </div>

            {/* LLM Toggle */}
            <div className="flex items-center gap-2 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <span>
                  استجابة ذكاء اصطناعي محسّنة
                  {llmStatus.isInitializing && " (جاري التهيئة...)"}
                  {!llmStatus.isReady &&
                    !llmStatus.isInitializing &&
                    " (غير متوفر)"}
                </span>
                <input
                  type="checkbox"
                  checked={useLLM}
                  onChange={(e) => setUseLLM(e.target.checked)}
                  disabled={!llmStatus.isReady}
                  className="rounded"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {showHistory && (
          <aside className="w-80">
            <SessionHistory
              onLoadSession={handleLoadSession}
              currentSessionId={sessionId}
            />
          </aside>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-subtle py-4 text-center text-sm text-gray-600">
        <p>⚠️ هذا ليس بديلاً عن الرعاية النفسية المهنية</p>
        <p className="mt-1">
          إذا كنت في أزمة، اتصل بـ <strong>08008880700</strong> (مصر) أو قم
          بزيارة{" "}
          <a
            href="https://findahelpline.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            findahelpline.com
          </a>
        </p>
      </footer>
    </div>
  );
}
