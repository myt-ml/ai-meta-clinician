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
      {/* Messages Container - Clinical Console Style */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="px-4 py-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
              {/* Welcome Message */}
              <div className="flex flex-col items-center gap-2">
                <h2 className="text-h2 font-medium text-textMain">
                  Clinical Support System
                </h2>
                <p className="text-body text-textSubtle max-w-md">
                  Begin a consultation by selecting a topic or typing your
                  concern.
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
                    className="p-3 bg-surfaceAlt border border-border rounded-md transition-colors text-left focus:outline-none focus:ring-2 focus:ring-primary hover:bg-gray-100"
                    aria-label={`Start conversation: ${prompt}`}
                  >
                    <span className="text-sm text-textMain">{prompt}</span>
                  </button>
                ))}
              </div>

              {/* Disclaimer */}
              <div className="w-full max-w-2xl bg-surfaceAlt border border-border rounded-md p-3">
                <p className="text-caption text-textSubtle">
                  <strong>Note:</strong> This system provides guidance but is
                  not a replacement for professional medical care.
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
                  className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 border ${
                    message.role === "user"
                      ? "bg-gray-100 border-border text-textSubtle"
                      : "bg-primary/10 border-primary/20 text-primary"
                  }`}
                  aria-hidden="true"
                >
                  {message.role === "user" ? (
                    <svg
                      className="h-4 w-4 flex-shrink-0"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
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
                      className="h-4 w-4 flex-shrink-0"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>

                {/* Message Bubble */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`rounded-md px-3 py-2 break-words overflow-wrap-anywhere ${
                      message.role === "user"
                        ? "bg-surfaceAlt border border-border"
                        : message.role === "system"
                        ? "bg-blue-50 border border-primary/20"
                        : "bg-surface border border-border"
                    }`}
                  >
                    {message.riskLevel && message.riskLevel !== "low" && (
                      <div className="flex items-center gap-2 mb-2 text-caption font-medium">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            message.riskLevel === "critical"
                              ? "bg-danger animate-pulseSlow"
                              : message.riskLevel === "high"
                              ? "bg-warning"
                              : "bg-yellow-500"
                          }`}
                          aria-hidden="true"
                        />
                        {message.riskLevel === "critical" && "URGENT"}
                        {message.riskLevel === "high" && "Important"}
                        {message.riskLevel === "moderate" && "Note"}
                      </div>
                    )}
                    <p className="text-body text-textMain leading-relaxed break-words whitespace-normal">
                      {message.text}
                    </p>
                    <p className="text-caption text-textMuted mt-1">
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
              <div
                className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-primary"
                aria-hidden="true"
              >
                <svg
                  className="h-4 w-4 flex-shrink-0"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="bg-surface border border-border rounded-md px-3 py-2">
                <div
                  className="flex items-center gap-1.5"
                  role="status"
                  aria-label="Processing"
                >
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                  <div
                    className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "0.15s" }}
                  ></div>
                  <div
                    className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "0.3s" }}
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
