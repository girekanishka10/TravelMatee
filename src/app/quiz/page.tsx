"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QUIZ_QUESTIONS, type QuizQuestion } from "@/lib/quiz";
import { buildPersonality } from "@/lib/personality";
import { useApp } from "@/lib/store";
import type { CompatibilityAnswers } from "@/lib/types";

export default function QuizPage() {
  const { completeQuiz, currentUser } = useApp();
  const router = useRouter();

  const [answers, setAnswers] = useState<Partial<CompatibilityAnswers>>(() => {
    return currentUser?.compatibilityAnswers ? { ...currentUser.compatibilityAnswers } : {};
  });

  // Track if existing answers were found
  const hasExistingAnswers = Boolean(
    currentUser?.compatibilityAnswers && Object.keys(currentUser.compatibilityAnswers).length > 0
  );

  // Sync with currentUser if loaded asynchronously
  useEffect(() => {
    if (currentUser?.compatibilityAnswers) {
      setAnswers((prev) =>
        Object.keys(prev).length === 0 ? { ...currentUser.compatibilityAnswers } : prev
      );
    }
  }, [currentUser?.compatibilityAnswers]);

  // View mode: "review" (edit individual questions) or "wizard" (step-by-step)
  const [viewMode, setViewMode] = useState<"review" | "wizard">(
    hasExistingAnswers ? "review" : "wizard"
  );

  // Wizard state
  const [wizardIndex, setWizardIndex] = useState(0);

  // Individual question editing state
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [draftAnswer, setDraftAnswer] = useState<string | string[]>("");
  const [editError, setEditError] = useState<string | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const total = QUIZ_QUESTIONS.length;
  const answeredCount = QUIZ_QUESTIONS.filter((q) => {
    const val = answers[q.id as keyof CompatibilityAnswers];
    if (Array.isArray(val)) return val.length > 0;
    return Boolean(val);
  }).length;

  const personality = useMemo(() => {
    if (!done) return null;
    return buildPersonality(answers as CompatibilityAnswers);
  }, [done, answers]);

  // Current question in wizard mode
  const currentWizardQ = QUIZ_QUESTIONS[wizardIndex];
  const wizardSingle =
    typeof answers[currentWizardQ.id as keyof CompatibilityAnswers] === "string"
      ? (answers[currentWizardQ.id as keyof CompatibilityAnswers] as string)
      : "";
  const wizardMultiple: string[] = Array.isArray(
    answers[currentWizardQ.id as keyof CompatibilityAnswers]
  )
    ? (answers[currentWizardQ.id as keyof CompatibilityAnswers] as string[])
    : [];

  // Helper to start editing an individual question
  function handleStartEdit(questionId: string) {
    const q = QUIZ_QUESTIONS.find((item) => item.id === questionId);
    if (!q) return;

    const existingVal = answers[questionId as keyof CompatibilityAnswers];
    if (existingVal !== undefined && existingVal !== null) {
      if (Array.isArray(existingVal)) {
        setDraftAnswer([...existingVal.map(String)]);
      } else {
        setDraftAnswer(String(existingVal));
      }
    } else {
      setDraftAnswer(q.type === "multiple" || q.type === "rank" ? [] : "");
    }
    setEditError(null);
    setEditingQuestionId(questionId);
  }

  // Cancel individual edit - restores previous saved answer
  function handleCancelEdit() {
    setEditingQuestionId(null);
    setDraftAnswer("");
    setEditError(null);
  }

  // Save individual edit
  function handleSaveEdit(q: QuizQuestion) {
    let isValid = false;
    if (q.type === "multiple") {
      isValid = Array.isArray(draftAnswer) && draftAnswer.length > 0;
    } else if (q.type === "rank") {
      isValid = Array.isArray(draftAnswer) && draftAnswer.length >= 1;
    } else {
      isValid = typeof draftAnswer === "string" && draftAnswer.trim().length > 0;
    }

    if (!isValid) {
      setEditError(
        q.type === "multiple"
          ? "Please select at least one activity."
          : q.type === "rank"
          ? "Please select at least one priority."
          : "Please choose an answer option."
      );
      return;
    }

    // Preserve every other answer and update only this question
    setAnswers((prev) => ({
      ...prev,
      [q.id]: draftAnswer,
    }));
    setEditingQuestionId(null);
    setDraftAnswer("");
    setEditError(null);
    setFeedbackNotice(`✓ Question ${q.number} updated. Click "Done" to apply changes.`);
    setTimeout(() => setFeedbackNotice(null), 5000);
  }

  // Multi-select toggle for draft answer
  function toggleDraftMultiple(val: string) {
    const current = Array.isArray(draftAnswer) ? draftAnswer : [];
    const next = current.includes(val)
      ? current.filter((x) => x !== val)
      : [...current, val];
    setDraftAnswer(next);
    if (editError) setEditError(null);
  }

  // Rank toggle for draft answer
  function toggleDraftRank(val: string) {
    const current = Array.isArray(draftAnswer) ? draftAnswer : [];
    if (current.includes(val)) {
      setDraftAnswer(current.filter((x) => x !== val));
      return;
    }
    if (current.length >= 3) {
      setDraftAnswer([...current.slice(0, 2), val]);
      return;
    }
    setDraftAnswer([...current, val]);
    if (editError) setEditError(null);
  }

  // Single select for draft answer
  function selectDraftSingle(val: string) {
    setDraftAnswer(val);
    if (editError) setEditError(null);
  }

  // Wizard answer handlers
  function selectWizardSingle(val: string) {
    setAnswers((prev) => ({ ...prev, [currentWizardQ.id]: val }));
  }

  function toggleWizardMultiple(val: string) {
    setAnswers((prev) => {
      const current = Array.isArray(prev[currentWizardQ.id as keyof CompatibilityAnswers])
        ? (prev[currentWizardQ.id as keyof CompatibilityAnswers] as string[])
        : [];
      const next = current.includes(val)
        ? current.filter((x) => x !== val)
        : [...current, val];
      return { ...prev, [currentWizardQ.id]: next };
    });
  }

  function toggleWizardRank(val: string) {
    setAnswers((prev) => {
      const current = Array.isArray(prev[currentWizardQ.id as keyof CompatibilityAnswers])
        ? (prev[currentWizardQ.id as keyof CompatibilityAnswers] as string[])
        : [];
      if (current.includes(val)) {
        return { ...prev, [currentWizardQ.id]: current.filter((x) => x !== val) };
      }
      if (current.length >= 3) {
        return { ...prev, [currentWizardQ.id]: [...current.slice(0, 2), val] };
      }
      return { ...prev, [currentWizardQ.id]: [...current, val] };
    });
  }

  const isCurrentWizardValid =
    currentWizardQ.type === "multiple"
      ? wizardMultiple.length > 0
      : currentWizardQ.type === "rank"
      ? wizardMultiple.length >= 1
      : Boolean(wizardSingle);

  function handleWizardNext() {
    if (!isCurrentWizardValid) return;
    if (wizardIndex < total - 1) {
      setWizardIndex(wizardIndex + 1);
    } else {
      handleDone();
    }
  }

  function handleWizardBack() {
    if (wizardIndex > 0) {
      setWizardIndex(wizardIndex - 1);
    }
  }

  // Finish and apply changes
  function handleDone() {
    if (isSubmitting) return;

    // Check that all 15 questions have answers
    const unanswered = QUIZ_QUESTIONS.filter((q) => {
      const val = answers[q.id as keyof CompatibilityAnswers];
      if (Array.isArray(val)) return val.length === 0;
      return !val;
    });

    if (unanswered.length > 0) {
      setFeedbackNotice(
        `Please complete all questions before finishing. Question ${unanswered[0].number} is not answered.`
      );
      return;
    }

    setIsSubmitting(true);
    completeQuiz(answers as CompatibilityAnswers);
    setDone(true);
    setIsSubmitting(false);
  }

  // Screen shown when quiz / edit is done
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
            Continue to Zovira →
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
              Compatibility Assessment
            </h1>
            <span className="rounded-full bg-forest/10 text-forest px-2.5 py-0.5 text-xs font-semibold">
              {answeredCount}/{total} Answered
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Edit individual questions and options or walk through sequentially.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex rounded-lg border border-line bg-paper p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("review")}
              className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                viewMode === "review"
                  ? "bg-white text-ink shadow-xs font-semibold"
                  : "text-muted hover:text-ink"
              }`}
            >
              Edit Questions
            </button>
            <button
              type="button"
              onClick={() => setViewMode("wizard")}
              className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                viewMode === "wizard"
                  ? "bg-white text-ink shadow-xs font-semibold"
                  : "text-muted hover:text-ink"
              }`}
            >
              Step-by-Step
            </button>
          </div>

          <button
            type="button"
            onClick={handleDone}
            disabled={isSubmitting || answeredCount < total}
            className="rounded-lg bg-[#214c38] text-white px-4 py-2 text-xs font-semibold hover:bg-[#153a25] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>

      {/* Notification banner */}
      {feedbackNotice && (
        <div className="mt-4 rounded-xl border border-forest/30 bg-forest/10 p-3 text-xs text-forest">
          {feedbackNotice}
        </div>
      )}

      {/* VIEW MODE 1: REVIEW & EDIT INDIVIDUAL QUESTIONS */}
      {viewMode === "review" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-line bg-card p-4 text-xs text-muted flex items-center justify-between">
            <span>
              Click <strong>Edit</strong> on any question (such as Question 3) to modify its answer or options, then click <strong>Save</strong> and <strong>Done</strong>.
            </span>
            <Link href="/app/profile" className="text-forest hover:underline font-medium shrink-0 ml-3">
              Return to Profile
            </Link>
          </div>

          {QUIZ_QUESTIONS.map((q) => {
            const isEditing = editingQuestionId === q.id;
            const savedValue = answers[q.id as keyof CompatibilityAnswers];

            // Render saved answer summary
            let renderedAnswer = null;
            if (Array.isArray(savedValue) && savedValue.length > 0) {
              renderedAnswer = (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {savedValue.map((item, idx) => (
                    <span
                      key={item}
                      className="rounded-md border border-line bg-paper px-2.5 py-1 text-xs font-medium text-ink"
                    >
                      {q.type === "rank" ? `#${idx + 1} ` : ""}
                      {item}
                    </span>
                  ))}
                </div>
              );
            } else if (typeof savedValue === "string" && savedValue) {
              renderedAnswer = (
                <p className="mt-1.5 text-xs font-medium text-forest bg-forest/10 inline-block px-2.5 py-1 rounded-md">
                  {savedValue}
                </p>
              );
            } else {
              renderedAnswer = (
                <p className="mt-1.5 text-xs italic text-muted">Not answered yet</p>
              );
            }

            if (isEditing) {
              // EDITABLE STATE FOR THIS QUESTION
              const draftMultiple = Array.isArray(draftAnswer) ? draftAnswer : [];
              const draftSingle = typeof draftAnswer === "string" ? draftAnswer : "";

              return (
                <div
                  key={q.id}
                  className="rounded-xl border-2 border-[#214c38] bg-card p-5 shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between border-b border-line pb-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#214c38] px-2.5 py-0.5 text-[11px] font-bold text-white">
                        Question {q.number}
                      </span>
                      <span className="text-xs font-semibold text-forest">Editing Answer</span>
                    </div>
                    {q.subtitle && (
                      <span className="text-xs text-muted bg-paper px-2 py-0.5 rounded border border-line">
                        {q.subtitle}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 font-serif text-lg font-bold text-ink leading-snug">
                    {q.question}
                  </h3>

                  {editError && (
                    <p className="mt-2 text-xs font-medium text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                      {editError}
                    </p>
                  )}

                  {/* Options Selector */}
                  <div className="mt-4 space-y-2">
                    {/* MULTIPLE SELECTIONS (e.g. Q3 Activities) */}
                    {q.type === "multiple" && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted mb-1">
                          Select all that apply ({draftMultiple.length} selected):
                        </p>
                        {q.options.map((opt) => {
                          const isSelected = draftMultiple.includes(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => toggleDraftMultiple(opt)}
                              className={`w-full rounded-lg border px-4 py-2.5 text-left text-xs transition-all flex items-center justify-between ${
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

                    {/* RANK TOP 3 (e.g. Q9 Priorities) */}
                    {q.type === "rank" && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted mb-1">
                          Click options in order of importance to rank top 3 ({draftMultiple.length}/3 selected):
                        </p>
                        {q.options.map((opt) => {
                          const rankIdx = draftMultiple.indexOf(opt);
                          const isSelected = rankIdx >= 0;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => toggleDraftRank(opt)}
                              className={`w-full rounded-lg border px-4 py-2.5 text-left text-xs transition-all flex items-center justify-between ${
                                isSelected
                                  ? "border-[#214c38] bg-[#eef5f0] text-[#153a25] font-medium"
                                  : "border-line bg-paper text-ink hover:border-[#214c38]/40"
                              }`}
                            >
                              <span>{opt}</span>
                              <span
                                className={`h-5 px-2 rounded-full border text-[11px] font-semibold flex items-center justify-center shrink-0 ${
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

                    {/* SINGLE CHOICE */}
                    {(!q.type || q.type === "single") && (
                      <div className="space-y-2">
                        {q.options.map((opt) => {
                          const isSelected = draftSingle === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => selectDraftSingle(opt)}
                              className={`w-full rounded-lg border px-4 py-2.5 text-left text-xs transition-all flex items-center justify-between ${
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

                  {/* Individual Save / Cancel actions */}
                  <div className="mt-5 flex items-center justify-end gap-2.5 pt-4 border-t border-line">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="btn-secondary rounded-lg px-3.5 py-1.5 text-xs font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(q)}
                      className="rounded-lg bg-[#214c38] text-white px-4 py-1.5 text-xs font-semibold hover:bg-[#153a25] transition-colors"
                    >
                      Save Question {q.number}
                    </button>
                  </div>
                </div>
              );
            }

            // READ-ONLY / SUMMARY STATE FOR THIS QUESTION
            return (
              <div
                key={q.id}
                className="rounded-xl border border-line bg-card p-4 transition-all hover:border-forest/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                        Question {q.number}
                      </span>
                      {q.subtitle && (
                        <span className="text-[10px] text-muted bg-sand/60 px-1.5 py-0.5 rounded">
                          {q.subtitle}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-1 text-sm font-semibold text-ink leading-snug">
                      {q.question}
                    </h2>
                    {renderedAnswer}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartEdit(q.id)}
                    className="shrink-0 rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink hover:bg-sand/60 hover:border-forest/40 transition-colors"
                  >
                    ✏️ Edit
                  </button>
                </div>
              </div>
            );
          })}

          {/* Bottom Done bar */}
          <div className="sticky bottom-4 mt-8 rounded-xl border border-line bg-card/95 p-4 shadow-lg backdrop-blur-xs flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-ink">Finished reviewing your answers?</p>
              <p className="text-[11px] text-muted">
                Clicking Done updates your profile and recalculates your companion compatibility scores.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDone}
              disabled={isSubmitting || answeredCount < total}
              className="rounded-lg bg-[#214c38] text-white px-5 py-2.5 text-xs font-semibold hover:bg-[#153a25] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs shrink-0"
            >
              ✓ Done — Apply Changes
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: STEP-BY-STEP WIZARD */}
      {viewMode === "wizard" && (
        <div className="mt-6">
          {/* Top progress indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-muted font-medium mb-2">
              <span>Question {wizardIndex + 1} of {total}</span>
              <span>{Math.round(((wizardIndex + 1) / total) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-sand overflow-hidden">
              <div
                className="h-full bg-[#214c38] transition-all duration-200"
                style={{ width: `${((wizardIndex + 1) / total) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="rounded-xl border border-line bg-card p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Question {wizardIndex + 1}
              </span>
              {currentWizardQ.subtitle && (
                <span className="text-xs text-muted bg-paper px-2 py-0.5 rounded border border-line">
                  {currentWizardQ.subtitle}
                </span>
              )}
            </div>

            <h2 className="mt-2 font-serif text-xl font-bold text-ink leading-snug">
              {currentWizardQ.question}
            </h2>

            {/* Options */}
            <div className="mt-5 space-y-2.5">
              {/* MULTIPLE SELECTIONS (Q3) */}
              {currentWizardQ.type === "multiple" && (
                <div className="space-y-2">
                  <p className="text-xs text-muted mb-2">
                    Select all that apply ({wizardMultiple.length} selected):
                  </p>
                  {currentWizardQ.options.map((opt) => {
                    const isSelected = wizardMultiple.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleWizardMultiple(opt)}
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
              {currentWizardQ.type === "rank" && (
                <div className="space-y-2">
                  <p className="text-xs text-muted mb-2">
                    Click options in order of importance to rank top 3 ({wizardMultiple.length}/3 selected):
                  </p>
                  {currentWizardQ.options.map((opt) => {
                    const rankIdx = wizardMultiple.indexOf(opt);
                    const isSelected = rankIdx >= 0;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleWizardRank(opt)}
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
              {(!currentWizardQ.type || currentWizardQ.type === "single") && (
                <div className="space-y-2">
                  {currentWizardQ.options.map((opt) => {
                    const isSelected = wizardSingle === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => selectWizardSingle(opt)}
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
                disabled={wizardIndex === 0}
                onClick={handleWizardBack}
                className="rounded-lg border border-line bg-paper px-4 py-2 text-xs font-medium text-ink hover:bg-sand/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Back
              </button>

              <button
                type="button"
                disabled={!isCurrentWizardValid}
                onClick={handleWizardNext}
                className="rounded-lg bg-[#e2ede5] text-[#153a25] border border-[#b5d2be] px-5 py-2 text-xs font-semibold hover:bg-[#d1e4d6] hover:text-[#0b2517] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {wizardIndex === total - 1 ? "Complete Test" : "Next Question →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
