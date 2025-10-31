"use client";

import { useState, useEffect } from "react";
import ChatWindow, { Message } from "@/components/ChatWindow";
import VoiceInput from "@/components/VoiceInput";
import LanguageToggle from "@/components/LanguageToggle";
import PHQForm from "@/components/PHQForm";
import SessionHistory from "@/components/SessionHistory";
import { triage, type Language } from "@/lib/mhgap/triageEngine";
import {
  initLLM,
  isLLMReady,
  generateClinicalAssessment,
  getInitStatus,
} from "@/lib/llm/webllmClient";
import { saveSession, type Session } from "@/lib/session/sessionManager";

export default function HomePage() {
  const [language, setLanguage] = useState<Language>("en");
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

  // Save session on message changes
  useEffect(() => {
    if (messages.length > 1) {
      const levels = ["low", "moderate", "high", "critical"];
      const maxRiskLevel = messages.reduce<
        "low" | "moderate" | "high" | "critical"
      >((max, m) => {
        const currentLevel = m.riskLevel || "low";
        return levels.indexOf(currentLevel) > levels.indexOf(max)
          ? currentLevel
          : max;
      }, "low");

      const currentSession: Session = {
        id: sessionId,
        startTime: messages[0].timestamp.toISOString(),
        lastUpdate: new Date().toISOString(),
        messages: messages.slice(1), // Exclude initial greeting
        riskLevel: maxRiskLevel,
        language,
        flaggedForReview: riskAlert !== null,
      };
      saveSession(currentSession);
    }
  }, [messages, sessionId, language, riskAlert]);

  const handleInitLLM = async () => {
    try {
      setLlmStatus({
        isReady: false,
        isInitializing: true,
        progress: "Initializing...",
      });
      await initLLM({}, (report) => {
        setLlmStatus({
          isReady: false,
          isInitializing: true,
          progress: `${report.text} (${report.progress.toFixed(0)}%)`,
        });
      });
      setLlmStatus({ isReady: true, isInitializing: false, progress: "Ready" });
      setUseLLM(true);
    } catch (error) {
      console.error("LLM initialization failed:", error);
      setLlmStatus({
        isReady: false,
        isInitializing: false,
        progress: "Failed to initialize",
      });
    }
  };

  const handleUserInput = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((m) => [...m, userMessage]);
    setInputText("");
    setIsProcessing(true);

    try {
      // Run triage
      const result = await triage(text, language);

      // Check for risk alerts
      if (result.riskLevel === "critical" || result.riskLevel === "high") {
        setRiskAlert({
          level: result.riskLevel,
          message:
            result.riskLevel === "critical"
              ? "URGENT: This session has been flagged for immediate clinical review due to critical risk indicators."
              : "This session has been flagged for clinical review due to high-risk indicators.",
        });
      }

      // Generate response (use LLM if available and enabled, otherwise use triage)
      let responseText = result.text;
      if (useLLM && isLLMReady()) {
        try {
          const conversationHistory = messages.slice(1).map((m) => ({
            role:
              m.role === "user" ? ("user" as const) : ("assistant" as const),
            content: m.text,
          }));

          responseText = await generateClinicalAssessment(
            text,
            {
              category: result.category,
              riskLevel: result.riskLevel,
              score: result.score,
            },
            language,
            conversationHistory
          );
        } catch (llmError) {
          console.warn(
            "LLM generation failed, using triage response:",
            llmError
          );
          // Fall back to triage response
        }
      }

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: responseText,
        timestamp: new Date(),
        riskLevel: result.riskLevel,
      };
      setMessages((m) => [...m, aiMessage]);
    } catch (error) {
      console.error("Error processing input:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "system",
        text: "I apologize, but I encountered an error processing your message. Please try again.",
        timestamp: new Date(),
      };
      setMessages((m) => [...m, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSession = (session: Session) => {
    setMessages([
      messages[0], // Keep initial greeting
      ...session.messages,
    ]);
    setSessionId(session.id);
    setLanguage(session.language);
    if (session.flaggedForReview) {
      setRiskAlert({
        level: session.riskLevel as "moderate" | "high" | "critical",
        message: "This loaded session was previously flagged for review.",
      });
    }
    setShowHistory(false);
  };

  const handlePHQSubmit = (score: number, responses: number[]) => {
    let interpretation = "";
    let severity = "";

    if (score <= 4) {
      severity = "minimal";
      interpretation =
        "Your responses suggest minimal depression symptoms. However, if you're concerned about your mental health, it's always good to talk to a professional.";
    } else if (score <= 9) {
      severity = "mild";
      interpretation =
        "Your responses suggest mild depression symptoms. Consider monitoring your symptoms and reaching out for support if they worsen or persist.";
    } else if (score <= 14) {
      severity = "moderate";
      interpretation =
        "Your responses suggest moderate depression. I recommend speaking with a mental health professional who can provide appropriate support and treatment options.";
    } else if (score <= 19) {
      severity = "moderately severe";
      interpretation =
        "Your responses suggest moderately severe depression. It's important to seek professional help. A mental health professional can work with you on treatment options.";
    } else {
      severity = "severe";
      interpretation =
        "Your responses suggest severe depression. Please seek professional help as soon as possible. Would you like help finding resources?";
      setRiskAlert({
        level: "high",
        message:
          "PHQ-9 score indicates severe depression. Professional evaluation recommended.",
      });
    }

    const phqMessage: Message = {
      id: Date.now().toString(),
      role: "system",
      text: `PHQ-9 Assessment Complete\n\nScore: ${score}/27 (${severity})\n\n${interpretation}`,
      timestamp: new Date(),
      riskLevel: score >= 15 ? "high" : score >= 10 ? "moderate" : "low",
    };

    setMessages((m) => [...m, phqMessage]);
  };

  return (
    <>
      {showHistory && (
        <SessionHistory
          onLoadSession={handleLoadSession}
          onClose={() => setShowHistory(false)}
        />
      )}
      {/* Screen Reader Announcer */}
      <div
        id="sr-announcer"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />

      <div className="h-screen flex flex-col overflow-hidden bg-white">
        {/* Header - Mental Health App Style */}
        <header className="border-b border-subtle bg-white sticky top-0 z-50">
          <div className="flex items-center justify-between px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="font-semibold text-primary">MindCare AI</h1>
                <p className="text-sm text-gray-600">Mental Health Support</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <LanguageToggle current={language} onChange={setLanguage} />
              <button
                onClick={() => setShowHistory(true)}
                className="text-sm font-medium text-primary hover:underline focus:outline-none"
                aria-label="Open session history"
              >
                History
              </button>
              {/* Screening trigger rendered via component */}
              <PHQForm onSubmit={handlePHQSubmit} language={language} />
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Control Bar - removed to simplify and reduce cognitive load */}
          <div className="flex-shrink-0 border-b border-subtle bg-white"></div>

          {/* Risk Alert */}
          {riskAlert && (
            <div
              className={`p-4 rounded-xl border-2 ${
                riskAlert.level === "critical"
                  ? "bg-red-50 border-red-600 text-red-900"
                  : riskAlert.level === "high"
                  ? "bg-orange-50 border-orange-600 text-orange-900"
                  : "bg-yellow-50 border-yellow-600 text-yellow-900"
              }`}
              role="alert"
              aria-live="assertive"
            >
              <div className="flex items-start gap-3">
                <svg
                  className={`w-5 h-5 flex-shrink-0 ${
                    riskAlert.level === "critical" ? "animate-pulse" : ""
                  }`}
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{riskAlert.message}</p>
                  <button
                    onClick={() => setRiskAlert(null)}
                    className="text-xs underline mt-1 hover:no-underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Chat Window - Fixed height with scroll */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ChatWindow
              messages={messages}
              isLoading={isProcessing}
              onStarterPromptClick={handleUserInput}
            />
          </div>

          {/* Input Area - Mental Health App Style */}
          <div className="border-t border-gray-200/50 bg-white/80 backdrop-blur-md shadow-lg flex-shrink-0">
            <div className="max-w-4xl mx-auto px-4 py-3">
              <div className="flex gap-2 items-end">
                <VoiceInput
                  onTranscribed={handleUserInput}
                  language={language}
                  disabled={isProcessing}
                />
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !isProcessing) {
                      e.preventDefault();
                      handleUserInput(inputText);
                    }
                  }}
                  placeholder={
                    language === "en"
                      ? "Type your message here..."
                      : language === "ar_egy"
                      ? "اكتب رسالتك هنا..."
                      : "اكتب رسالتك هنا..."
                  }
                  disabled={isProcessing}
                  rows={1}
                  className="flex-1 px-4 py-3 border border-subtle rounded-2xl focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] disabled:bg-gray-50 disabled:cursor-not-allowed transition-all text-sm resize-none shadow-sm bg-white/90"
                />
                <button
                  onClick={() => handleUserInput(inputText)}
                  disabled={isProcessing || !inputText.trim()}
                  className="px-4 py-3 bg-[var(--color-primary)] hover:opacity-90 text-white rounded-2xl font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
                  title="Send message"
                  aria-label="Send message"
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>

          {/* Emergency Resources - Sticky Bottom */}
          <div className="bg-alert border-t-2 border-alert px-4 py-2 text-xs flex-shrink-0">
            <p className="max-w-4xl mx-auto text-alert">
              <span className="font-semibold">Emergency:</span>
              <span className="ml-2">
                If in immediate danger, call
                <a href="tel:911" className="underline font-semibold ml-1">
                  911
                </a>
                or crisis helpline
                <a href="tel:988" className="underline font-semibold ml-1">
                  988
                </a>
                .
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
