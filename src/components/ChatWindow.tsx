"use client";

import { useEffect, useRef, useState } from "react";

export interface Message {
  id: string;
  role: "user" | "ai" | "system";
  text: string;
  timestamp: Date;
  riskLevel?: "low" | "moderate" | "high" | "critical";
}

interface ChatWindowProps {
  messages: Message[];
  isLoading?: boolean;
  onStarterPromptClick?: (prompt: string) => void;
}

export default function ChatWindow({
  messages,
  isLoading = false,
  onStarterPromptClick,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setIsClient(true);
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Messages Container - Mental Health App Style */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
              {/* Welcome Message with Heart Icon */}
              <div className="flex flex-col items-center gap-2">
                <div className="bg-gradient-to-br from-[#0071CE] to-[#005EB8] p-4 rounded-3xl shadow-xl shadow-blue-200/50">
                  <svg
                    className="h-8 w-8 text-white flex-shrink-0"
                    width="32"
                    height="32"
                    fill="white"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Welcome to MindCare AI
                </h2>
                <p className="text-sm text-gray-600 max-w-md">
                  I&apos;m here to provide mental health support and guidance.
                  Choose a topic below or share what&apos;s on your mind.
                </p>
              </div>

              {/* Starter Prompts */}
              <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  "I'm feeling anxious and need coping strategies",
                  "I'm having trouble sleeping lately",
                  "I want to improve my mental health routine",
                  "I'm struggling with stress management",
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onStarterPromptClick?.(prompt);
                      const announcer = document.getElementById("sr-announcer");
                      if (announcer)
                        announcer.textContent = `Sent message: ${prompt}`;
                    }}
                    className="p-3 bg-subtle border border-subtle rounded-xl transition-all text-left focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] hover:opacity-90"
                    aria-label={`Start conversation: ${prompt}`}
                  >
                    <div className="flex items-start gap-3">
                      <svg
                        className="h-4 w-4 text-primary flex-shrink-0 mt-0.5"
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
                          d="M12 4v16M4 12h16"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">{prompt}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Disclaimer */}
              <div className="w-full max-w-2xl bg-white border border-subtle rounded-xl p-3">
                <p className="text-xs text-gray-600 break-words">
                  <strong>Note:</strong> This AI provides support but is not a
                  replacement for professional care.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-gray-200 to-gray-300"
                      : "bg-gradient-to-br from-[#0071CE] to-[#005EB8] shadow-blue-200/50"
                  }`}
                >
                  {message.role === "user" ? (
                    <svg
                      className="h-4 w-4 text-gray-600 flex-shrink-0"
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4 text-white flex-shrink-0"
                      width="16"
                      height="16"
                      fill="white"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  )}
                </div>

                {/* Message Bubble */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`rounded-2xl px-4 py-3 shadow-sm break-words overflow-wrap-anywhere ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-gray-100 to-gray-50"
                        : message.role === "system"
                        ? "bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/50"
                        : "bg-white border border-gray-200/50 hover:shadow-md transition-shadow"
                    }`}
                  >
                    {message.riskLevel && message.riskLevel !== "low" && (
                      <div className="flex items-center gap-2 mb-2 text-xs font-semibold">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            message.riskLevel === "critical"
                              ? "bg-red-600 animate-pulse"
                              : message.riskLevel === "high"
                              ? "bg-orange-500"
                              : "bg-yellow-500"
                          }`}
                        />
                        {message.riskLevel === "critical" && "URGENT"}
                        {message.riskLevel === "high" && "Important"}
                        {message.riskLevel === "moderate" && "Note"}
                      </div>
                    )}
                    <p className="text-sm leading-relaxed break-words whitespace-normal">
                      {message.text}
                    </p>
                    <p className="text-xs mt-2 text-gray-400">
                      {isClient
                        ? new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0071CE] to-[#005EB8] flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-200/50">
                <svg
                  className="h-4 w-4 text-white flex-shrink-0"
                  width="16"
                  height="16"
                  fill="white"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-[#0071CE] rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-[#0071CE] rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-[#0071CE] rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
