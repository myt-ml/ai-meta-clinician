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

      {/* Screen reader live region */}
      <div
        id="sr-announcer"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />

      <div className="h-screen flex flex-col bg-gray-50 text-textMain">
        {/* HEADER */}
        <header className="border-b bg-surface shadow-sm sticky top-0 z-50">
          <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3 gap-4">
            {/* Brand */}
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Meta-Clinician
              </h1>
              <p className="text-xs text-textMuted">
                Multilingual clinical support system
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <LanguageToggle current={language} onChange={setLanguage} />

              <button
                onClick={() => setShowHistory(true)}
                className="text-sm text-primary hover:underline focus:outline-none"
                aria-label="View session history"
              >
                Sessions
              </button>

              <PHQForm onSubmit={handlePHQSubmit} language={language} />
            </div>
          </div>
        </header>

        {/* PAGE BODY */}
        <main className="flex-1 overflow-hidden">
          <div className="max-w-5xl mx-auto h-full flex flex-col gap-3 px-4 py-3">
            {/* RISK ALERT */}
            {riskAlert && (
              <div
                className={`rounded-md border px-4 py-3 text-sm ${
                  riskAlert.level === "critical"
                    ? "bg-red-50 border-red-600 text-red-800"
                    : riskAlert.level === "high"
                    ? "bg-orange-50 border-orange-500 text-orange-800"
                    : "bg-yellow-50 border-yellow-600 text-yellow-800"
                }`}
                role="alert"
                aria-live="assertive"
              >
                <div className="flex justify-between">
                  <p className="font-medium">{riskAlert.message}</p>
                  <button
                    onClick={() => setRiskAlert(null)}
                    className="text-xs underline hover:no-underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* CHAT PANEL */}
            <div className="flex-1 min-h-0 bg-surface border rounded-lg shadow-sm flex flex-col">
              <ChatWindow
                messages={messages}
                isLoading={isProcessing}
                onStarterPromptClick={handleUserInput}
              />
            </div>

            {/* INPUT + VOICE */}
            <div className="flex gap-2">
              <VoiceInput
                onTranscribed={handleUserInput}
                language={language}
                disabled={isProcessing}
              />

              <div className="flex-1 flex flex-col">
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
                      ? "Type your message..."
                      : "اكتب رسالتك..."
                  }
                  disabled={isProcessing}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary bg-surface shadow-sm"
                  rows={2}
                />

                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => handleUserInput(inputText)}
                    disabled={!inputText.trim() || isProcessing}
                    className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium disabled:bg-gray-300 hover:bg-primary-dark transition-colors"
                  >
                    Send
                  </button>
                </div>

                <p className="text-[11px] text-textMuted mt-1">
                  Press Enter to send • Shift+Enter for new line
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* EMERGENCY FOOTER */}
        <footer className="bg-danger-soft border-t border-danger text-xs py-2">
          <div className="max-w-5xl mx-auto px-4 text-danger">
            Emergency support not provided. If you are in immediate danger,
            contact local emergency services.
          </div>
        </footer>
      </div>
    </>
  );
}
