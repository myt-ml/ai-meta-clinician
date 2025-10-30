"use client";

import { useState } from "react";

interface VoiceInputProps {
  onTranscribed: (text: string) => void;
  language: string;
  disabled?: boolean;
}

export default function VoiceInput({
  onTranscribed,
  language,
  disabled = false,
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const handleToggle = async () => {
    // Check for browser support
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      setIsSupported(false);
      alert(
        "Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari."
      );
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      // @ts-ignore - webkitSpeechRecognition is not in TypeScript types
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      // Set language based on current selection
      const langMap: { [key: string]: string } = {
        en: "en-US",
        ar_egy: "ar-EG",
        ar_msa: "ar-SA",
      };
      recognition.lang = langMap[language] || "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscribed(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "no-speech") {
          alert("No speech detected. Please try again.");
        } else if (event.error === "not-allowed") {
          alert(
            "Microphone access denied. Please allow microphone access in your browser settings."
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      setIsListening(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="w-full p-3 bg-gray-200 text-gray-500 rounded-xl text-center text-sm">
        Voice input not supported in this browser
      </div>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={disabled}
      className={`w-full p-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 ${
        isListening
          ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
          : disabled
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
      }`}
    >
      {isListening ? (
        <>
          <svg
            className="w-6 h-6 animate-pulse"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
              clipRule="evenodd"
            />
          </svg>
          <span>Listening... (Click to stop)</span>
        </>
      ) : (
        <>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          <span>Press to Speak</span>
        </>
      )}
    </button>
  );
}
