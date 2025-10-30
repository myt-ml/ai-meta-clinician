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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "ai",
      text: "Hello, I'm the AI Meta-Clinician. I'm here to provide confidential mental health support. Everything you share is private and secure. How can I help you today?",
      timestamp: new Date(),
      riskLevel: "low",
    },
  ]);
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
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center p-4 py-8">
        <div className="w-full max-w-4xl space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              AI Meta-Clinician
            </h1>
            <p className="text-gray-600">
              Comprehensive mental health support • Available 24/7 •
              Multilingual
            </p>
          </div>

          {/* Control Bar */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setShowHistory(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                📋 Session History
              </button>
              {!llmStatus.isReady && !llmStatus.isInitializing && (
                <button
                  onClick={handleInitLLM}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  🚀 Enable AI (WebLLM)
                </button>
              )}
              {llmStatus.isInitializing && (
                <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
                  ⏳ {llmStatus.progress || "Initializing AI..."}
                </div>
              )}
              {llmStatus.isReady && (
                <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium flex items-center gap-2">
                  ✅ AI Enhanced
                  <button
                    onClick={() => setUseLLM(!useLLM)}
                    className="text-xs underline hover:no-underline"
                  >
                    {useLLM ? "Disable" : "Enable"}
                  </button>
                </div>
              )}
            </div>
            <LanguageToggle current={language} onChange={setLanguage} />
          </div>

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
            >
              <div className="flex items-start gap-3">
                <svg
                  className={`w-6 h-6 flex-shrink-0 ${
                    riskAlert.level === "critical" ? "animate-pulse" : ""
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
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

          {/* PHQ-9 Screening */}
          <PHQForm onSubmit={handlePHQSubmit} language={language} />

          {/* Chat Window */}
          <ChatWindow messages={messages} isLoading={isProcessing} />

          {/* Input Area */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !isProcessing) {
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
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={() => handleUserInput(inputText)}
                disabled={isProcessing || !inputText.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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

            {/* Voice Input */}
            <VoiceInput
              onTranscribed={handleUserInput}
              language={language}
              disabled={isProcessing}
            />
          </div>

          {/* Emergency Resources */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
            <p className="font-semibold text-red-900 mb-2">
              🆘 Emergency Resources
            </p>
            <p className="text-red-800">
              If you&apos;re in immediate danger or having thoughts of suicide:{" "}
              <span className="font-bold">Call emergency services (911)</span>{" "}
              or contact a crisis helpline in your area.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
