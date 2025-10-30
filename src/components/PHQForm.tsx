"use client";

import { useState } from "react";
import type { Language } from "@/lib/mhgap/triageEngine";

interface PHQFormProps {
  onSubmit: (score: number, responses: number[]) => void;
  language: Language;
}

const phq9Questions = {
  en: [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling/staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
    "Trouble concentrating on things, such as reading the newspaper or watching television",
    "Moving or speaking so slowly that other people could have noticed. Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
    "Thoughts that you would be better off dead, or of hurting yourself in some way",
  ],
  ar_egy: [
    "قلة الاهتمام أو المتعة في عمل الأشياء",
    "الشعور بالإحباط أو الاكتئاب أو اليأس",
    "صعوبة في النوم أو البقاء نائماً، أو النوم كثيراً",
    "الشعور بالتعب أو قلة الطاقة",
    "قلة الشهية أو الإفراط في الأكل",
    "الشعور بالسوء تجاه نفسك — أو أنك فاشل أو خذلت نفسك أو عائلتك",
    "صعوبة في التركيز على الأشياء، مثل قراءة الجريدة أو مشاهدة التلفزيون",
    "الحركة أو التحدث ببطء شديد بحيث لاحظ الآخرون. أو العكس — التململ أو الانزعاج لدرجة أنك كنت تتحرك أكثر من المعتاد",
    "أفكار بأنك ستكون أفضل حالاً لو كنت ميتاً، أو أفكار بإيذاء نفسك بطريقة ما",
  ],
  ar_msa: [
    "قلة الاهتمام أو المتعة في فعل الأشياء",
    "الشعور بالإحباط أو الاكتئاب أو اليأس",
    "صعوبة في النوم أو البقاء نائماً، أو النوم المفرط",
    "الشعور بالتعب أو انخفاض الطاقة",
    "ضعف الشهية أو الإفراط في تناول الطعام",
    "الشعور بالسوء تجاه نفسك — أو أنك فاشل أو خذلت نفسك أو عائلتك",
    "صعوبة في التركيز على الأشياء، مثل قراءة الصحيفة أو مشاهدة التلفاز",
    "التحرك أو التحدث ببطء شديد بحيث لاحظ الآخرون. أو العكس — التململ الشديد بحيث تتحرك أكثر من المعتاد",
    "أفكار بأنك قد تكون أفضل حالاً لو كنت ميتاً، أو أفكار بإيذاء نفسك بطريقة ما",
  ],
};

const options = {
  en: [
    "Not at all",
    "Several days",
    "More than half the days",
    "Nearly every day",
  ],
  ar_egy: ["أبداً", "عدة أيام", "أكثر من نصف الأيام", "تقريباً كل يوم"],
  ar_msa: ["مطلقاً", "عدة أيام", "أكثر من نصف الأيام", "تقريباً كل يوم"],
};

const titles = {
  en: "PHQ-9 Depression Screening",
  ar_egy: "فحص الاكتئاب PHQ-9",
  ar_msa: "فحص الاكتئاب PHQ-9",
};

const subtitles = {
  en: "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
  ar_egy: "خلال الأسبوعين الماضيين، كم مرة أزعجتك أي من المشاكل التالية؟",
  ar_msa: "خلال الأسبوعين الماضيين، كم مرة أزعجتك أي من المشكلات التالية؟",
};

export default function PHQForm({ onSubmit, language }: PHQFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [responses, setResponses] = useState<number[]>(Array(9).fill(-1));
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const questions = phq9Questions[language];
  const opts = options[language];
  const title = titles[language];
  const subtitle = subtitles[language];

  const handleResponse = (value: number) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = value;
    setResponses(newResponses);

    if (currentQuestion < 8) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions answered, calculate score
      const score = newResponses.reduce((sum, val) => sum + val, 0);
      onSubmit(score, newResponses);
      setIsOpen(false);
      setCurrentQuestion(0);
      setResponses(Array(9).fill(-1));
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const progress = ((currentQuestion + 1) / 9) * 100;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full p-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
        <span>Take Depression Screening (PHQ-9)</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="text-sm text-purple-100 mt-1">{subtitle}</p>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setCurrentQuestion(0);
                setResponses(Array(9).fill(-1));
              }}
              className="text-white hover:text-purple-200"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-purple-800 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-purple-100 mt-2">
            Question {currentQuestion + 1} of 9
          </p>
        </div>

        {/* Question */}
        <div className="p-6">
          <p className="text-lg text-gray-800 mb-6 font-medium">
            {questions[currentQuestion]}
          </p>

          {/* Options */}
          <div className="space-y-3">
            {opts.map((option, index) => (
              <button
                key={index}
                onClick={() => handleResponse(index)}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                  responses[currentQuestion] === index
                    ? "border-purple-600 bg-purple-50 text-purple-900 font-semibold"
                    : "border-gray-200 hover:border-purple-400 hover:bg-purple-50 text-gray-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  <span className="text-sm text-gray-500">({index})</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          {currentQuestion > 0 && (
            <button
              onClick={handlePrevious}
              className="mt-6 px-4 py-2 text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous Question
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
