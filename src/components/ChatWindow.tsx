"use client";

import { useEffect, useRef } from "react";

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
}

export default function ChatWindow({
  messages,
  isLoading = false,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">AI Meta-Clinician</h2>
          <p className="text-xs text-blue-100">
            Confidential Mental Health Support
          </p>
        </div>
        <div
          className="w-3 h-3 bg-green-400 rounded-full animate-pulse"
          title="Online"
        ></div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-8">
            <svg
              className="w-16 h-16 mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <p className="text-sm">Welcome to AI Meta-Clinician</p>
            <p className="text-xs mt-2">
              Share what&apos;s on your mind. I&apos;m here to listen and
              support you.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : message.role === "system"
                    ? "bg-yellow-100 text-yellow-900 border border-yellow-300"
                    : "bg-white text-gray-800 shadow-md border border-gray-200"
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
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p
                  className={`text-xs mt-2 ${
                    message.role === "user" ? "text-blue-200" : "text-gray-400"
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 rounded-2xl px-4 py-3 shadow-md border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-100 px-4 py-2 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          🔒 Confidential • AI-assisted mental health support • Not a
          replacement for professional care
        </p>
      </div>
    </div>
  );
}
