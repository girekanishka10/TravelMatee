"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { QUIZ_QUESTIONS } from "@/lib/quiz";
import { buildPersonality } from "@/lib/personality";
import { useApp } from "@/lib/store";
import type { CompatibilityAnswers } from "@/lib/types";

export default function QuizPage() {
  const { completeQuiz } = useApp();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<CompatibilityAnswers>>({});
  const [done, setDone] = useState(false);

  const q = QUIZ_QUESTIONS[index];
  const total = QUIZ_QUESTIONS.length;

  const personality = useMemo(() => {
    if (!done) return null;
    return buildPersonality(answers as CompatibilityAnswers);
  }, [done, answers]);

  // Current values
  const currentSingle = typeof answers[q.id as keyof CompatibilityAnswers] === "string"
    ? (answers[q.id as keyof CompatibilityAnswers] as string)
    : "";

  const currentMultiple: string[] = Array.isArray(answers[q.id as keyof CompatibilityAnswers])
    ? (answers[q.id as keyof CompatibilityAnswers] as string[])
    : [];

  function selectSingle(val: string) {
    setAnswers((prev) => ({ ...prev, [q.id]: val }));
  }

  function toggleMultiple(val: string) {
    setAnswers((prev) => {
      const current = Array.isArray(prev[q.id as keyof CompatibilityAnswers])
        ? (prev[q.id as keyof CompatibilityAnswers] as string[])
        : [];
      const next = current.includes(val)
        ? current.filter((x) => x !== val)
        : [...current, val];
      return { ...prev, [q.id]: next };
    });
  }

  function toggleRank(val: string) {
    setAnswers((prev) => {
      const current = Array.isArray(prev[q.id as keyof CompatibilityAnswers])
        ? (prev[q.id as keyof CompatibilityAnswers] as string[])
        : [];
      if (current.includes(val)) {
        return { ...prev, [q.id]: current.filter((x) => x !== val) };
      }
      if (current.length >= 3) {
        // Replace last or ignore
        return { ...prev, [q.id]: [...current.slice(0, 2), val] };
      }
      return { ...prev, [q.id]: [...current, val] };
    });
  }

  const isCurrentValid =
    q.type === "multiple"
      ? currentMultiple.length > 0
      : q.type === "rank"
      ? currentMultiple.length >= 1
      : Boolean(currentSingle);

  function handleNext() {
    if (!isCurrentValid) return;
    if (index < total - 1) {
      setIndex(index + 1);
    } else {
      const fullAnswers = { ...answers } as CompatibilityAnswers;
      completeQuiz(fullAnswers);
      setDone(true);
    }
  }

  function handleBack() {
    if (index > 0) {
      setIndex(index - 1);
    }
  }

  if (done && personality) {
    return (
      <main className="mx-auto max-w-lg px-6 py-12">
        <div className="rounded-xl border border-line bg-card p-6">
          <p className="text-xs uppercase tracking-wider text-muted font-medium">Assessment Complete</p>
          <h1 className="mt-2 font-serif text-2xl font-bold text-ink">{personality.title}</h1>
          <p className="mt-2 text-xs text-muted leading-relaxed">
            Your responses to the 15 travel lifestyle questions have been saved. Your compatibility scores with companions and travel groups will now reflect these preferences.
          </p>

          <div className="mt-6 space-y-3 pt-4 border-t border-line">
            {Object.entries(personality.scores).map(([trait, score]) => (
              <div key={trait}>
                <div className="mb-1 flex justify-between text-xs capitalize text-ink">
                  <span>{trait}</span>
                  <span className="font-semibold text-ink">{score}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-sand">
                  <div
                    className="h-full rounded-full bg-[#214c38] transition-all duration-300"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push("/app")}
            className="mt-8 w-full rounded-lg bg-[#e2ede5] text-[#153a25] border border-[#b5d2be] py-2.5 text-sm font-semibold hover:bg-[#d1e4d6] hover:text-[#0b2517] transition-colors"
          >
            Continue to TravelMate →
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      {/* Top progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-muted font-medium mb-2">
          <span>Question {index + 1} of {total}</span>
          <span>{Math.round(((index + 1) / total) * 100)}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-sand overflow-hidden">
          <div
            className="h-full bg-[#214c38] transition-all duration-200"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="rounded-xl border border-line bg-card p-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Question {index + 1}
          </span>
          {q.subtitle && (
            <span className="text-xs text-muted bg-paper px-2 py-0.5 rounded border border-line">
              {q.subtitle}
            </span>
          )}
        </div>

        <h2 className="mt-2 font-serif text-xl font-bold text-ink leading-snug">
          {q.question}
        </h2>

        {/* Options */}
        <div className="mt-5 space-y-2.5">
          {/* MULTIPLE SELECTIONS (Q3) */}
          {q.type === "multiple" && (
            <div className="space-y-2">
              <p className="text-xs text-muted mb-2">
                Select all that apply ({currentMultiple.length} selected):
              </p>
              {q.options.map((opt) => {
                const isSelected = currentMultiple.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleMultiple(opt)}
                    className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-all flex items-center justify-between ${
                      isSelected
                        ? "border-[#214c38] bg-[#eef5f0] text-[#153a25] font-medium"
                        : "border-line bg-paper text-ink hover:border-[#214c38]/40"
                    }`}
                  >
                    <span>{opt}</span>
                    <span
                      className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 text-[10px] ${
                        isSelected
                          ? "border-[#214c38] bg-[#214c38] text-white"
                          : "border-line bg-white"
                      }`}
                    >
                      {isSelected ? "✓" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* RANK TOP 3 (Q9) */}
          {q.type === "rank" && (
            <div className="space-y-2">
              <p className="text-xs text-muted mb-2">
                Click options in order of importance to rank top 3 ({currentMultiple.length}/3 selected):
              </p>
              {q.options.map((opt) => {
                const rankIdx = currentMultiple.indexOf(opt);
                const isSelected = rankIdx >= 0;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleRank(opt)}
                    className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-all flex items-center justify-between ${
                      isSelected
                        ? "border-[#214c38] bg-[#eef5f0] text-[#153a25] font-medium"
                        : "border-line bg-paper text-ink hover:border-[#214c38]/40"
                    }`}
                  >
                    <span>{opt}</span>
                    <span
                      className={`h-5 px-2 rounded-full border text-xs font-semibold flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "border-[#214c38] bg-[#214c38] text-white"
                          : "border-line text-muted bg-white"
                      }`}
                    >
                      {isSelected ? `#${rankIdx + 1}` : "+"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* SINGLE CHOICE (All other questions) */}
          {(!q.type || q.type === "single") && (
            <div className="space-y-2">
              {q.options.map((opt) => {
                const isSelected = currentSingle === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => selectSingle(opt)}
                    className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-all flex items-center justify-between ${
                      isSelected
                        ? "border-[#214c38] bg-[#eef5f0] text-[#153a25] font-medium"
                        : "border-line bg-paper text-ink hover:border-[#214c38]/40"
                    }`}
                  >
                    <span>{opt}</span>
                    <span
                      className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? "border-[#214c38] bg-[#214c38]" : "border-line bg-white"
                      }`}
                    >
                      {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between gap-3 pt-4 border-t border-line">
          <button
            type="button"
            disabled={index === 0}
            onClick={handleBack}
            className="rounded-lg border border-line bg-paper px-4 py-2 text-xs font-medium text-ink hover:bg-sand/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Back
          </button>

          <button
            type="button"
            disabled={!isCurrentValid}
            onClick={handleNext}
            className="rounded-lg bg-[#e2ede5] text-[#153a25] border border-[#b5d2be] px-5 py-2 text-xs font-semibold hover:bg-[#d1e4d6] hover:text-[#0b2517] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {index === total - 1 ? "Complete Test" : "Next Question →"}
          </button>
        </div>
      </div>
    </main>
  );
}
