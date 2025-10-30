"use client";

import { useState } from "react";
import {
  Session,
  getSessions,
  deleteSession,
  exportSession,
  exportSessionAsText,
  getSessionStats,
} from "@/lib/session/sessionManager";

interface SessionHistoryProps {
  onLoadSession: (session: Session) => void;
  onClose: () => void;
}

export default function SessionHistory({
  onLoadSession,
  onClose,
}: SessionHistoryProps) {
  const [sessions, setSessions] = useState<Session[]>(getSessions());
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const handleDelete = (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this session? This action cannot be undone."
      )
    ) {
      deleteSession(id);
      setSessions(getSessions());
      if (selectedSession?.id === id) {
        setSelectedSession(null);
      }
    }
  };

  const handleExportJSON = (session: Session) => {
    exportSession(session);
  };

  const handleExportText = (session: Session) => {
    exportSessionAsText(session);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical":
        return "bg-red-100 text-red-900 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-900 border-orange-300";
      case "moderate":
        return "bg-yellow-100 text-yellow-900 border-yellow-300";
      default:
        return "bg-green-100 text-green-900 border-green-300";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Session History</h2>
            <p className="text-sm text-blue-100 mt-1">
              {sessions.length} saved sessions
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Session List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto p-4 space-y-2">
            {sessions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p>No sessions yet</p>
                <p className="text-xs mt-2">
                  Start a conversation to create your first session
                </p>
              </div>
            ) : (
              sessions.map((session) => {
                const stats = getSessionStats(session);
                return (
                  <button
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedSession?.id === session.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-gray-500">
                        {session.startTime.toLocaleDateString()}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getRiskColor(
                          session.riskLevel
                        )}`}
                      >
                        {session.riskLevel}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {session.startTime.toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-gray-600">
                      {stats.totalMessages} messages • {stats.durationMinutes}{" "}
                      min
                    </p>
                    {session.flaggedForReview && (
                      <span className="inline-block mt-2 text-xs text-red-600 font-semibold">
                        ⚠️ Flagged for Review
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Session Detail */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedSession ? (
              <div>
                {/* Session Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <h3 className="text-lg font-semibold mb-3">
                    Session Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Session ID:</span>
                      <p className="font-mono text-xs">
                        {selectedSession.id.slice(0, 8)}...
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Language:</span>
                      <p className="font-semibold">
                        {selectedSession.language.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Started:</span>
                      <p>{selectedSession.startTime.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Update:</span>
                      <p>{selectedSession.lastUpdate.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-semibold">Conversation</h3>
                  {selectedSession.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
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
                          <div className="text-xs font-semibold mb-2 flex items-center gap-2">
                            <span
                              className={`inline-block w-2 h-2 rounded-full ${
                                message.riskLevel === "critical"
                                  ? "bg-red-600 animate-pulse"
                                  : message.riskLevel === "high"
                                  ? "bg-orange-500"
                                  : "bg-yellow-500"
                              }`}
                            />
                            {message.riskLevel.toUpperCase()}
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">
                          {message.text}
                        </p>
                        <p
                          className={`text-xs mt-2 ${
                            message.role === "user"
                              ? "text-blue-200"
                              : "text-gray-400"
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => onLoadSession(selectedSession)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Continue Session
                  </button>
                  <button
                    onClick={() => handleExportJSON(selectedSession)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Export JSON
                  </button>
                  <button
                    onClick={() => handleExportText(selectedSession)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Export Transcript
                  </button>
                  <button
                    onClick={() => handleDelete(selectedSession.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Delete Session
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <svg
                  className="w-24 h-24 mb-4"
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
                <p className="text-lg">Select a session to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
