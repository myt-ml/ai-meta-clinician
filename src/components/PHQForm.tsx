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
        className="text-sm font-medium text-primary hover:underline focus:outline-none"
        aria-label="Open PHQ-9 screening"
      >
        Screening
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="bg-surface border border-border rounded-lg shadow-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="phq9-title"
      >
        {/* Header */}
        <div className="bg-primary text-white p-6 border-b border-primary-dark">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 id="phq9-title" className="text-h2 font-semibold">
                {title}
              </h2>
              <p className="text-caption opacity-90 mt-1">{subtitle}</p>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setCurrentQuestion(0);
                setResponses(Array(9).fill(-1));
              }}
              className="text-white hover:text-blue-200 flex-shrink-0"
              aria-label="Close screening"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div
            className="w-full rounded-full h-2"
            style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
          >
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-blue-100 mt-2">
            Question {currentQuestion + 1} of 9
          </p>
        </div>

        {/* Question */}
        <div className="p-6">
          <p className="text-lg text-gray-800 mb-6 font-medium">
            {questions[currentQuestion]}
          </p>

          {/* Options */}
          <div className="space-y-2">
            {opts.map((option, index) => (
              <button
                key={index}
                onClick={() => handleResponse(index)}
                className={`w-full p-3 text-left rounded-md border transition-all duration-[var(--motion-duration)] ${
                  responses[currentQuestion] === index
                    ? "border-primary bg-primary/5 text-textMain font-medium"
                    : "border-border hover:bg-surfaceAlt text-textMain"
                }`}
                aria-pressed={responses[currentQuestion] === index}
              >
                <div className="flex items-center justify-between">
                  <span className="text-body">{option}</span>
                  <span className="text-caption text-textMuted">({index})</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          {currentQuestion > 0 && (
            <button
              onClick={handlePrevious}
              className="mt-6 px-0 py-0 text-sm text-primary hover:underline font-medium flex items-center gap-1 transition-all"
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                width="20"
                height="20"
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
