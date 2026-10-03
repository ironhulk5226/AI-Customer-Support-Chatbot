import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFAQs,
  getKnowledgeGaps,
  generateFAQ,
  approveFAQ,
  rejectFAQ,
  updateFAQ,
} from "../services/api";
import Icon from "../components/Icon";

export default function ManageFAQs() {
  const navigate = useNavigate();

  const [faqs, setFaqs] = useState([]);
  const [knowledgeGaps, setKnowledgeGaps] = useState([]);
  const [generatingGapId, setGeneratingGapId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getFAQs();

      setFaqs(Array.isArray(response) ? response : response?.faqs || []);
    } catch (err) {
      console.error("FAQ loading failed:", err);
      setError("Unable to load FAQs.");
    } finally {
      setLoading(false);
    }
  };

  const loadKnowledgeGaps = async () => {
    try {
      const response = await getKnowledgeGaps("candidate");

      setKnowledgeGaps(
        Array.isArray(response)
          ? response
          : response?.knowledgeGaps || response?.gaps || [],
      );
    } catch (err) {
      console.error("Knowledge gap loading failed:", err);
      setError("Unable to load knowledge gaps.");
    }
  };

  const handleGenerateFAQ = async (gap) => {
    try {
      setGeneratingGapId(gap._id);
      setError("");

      await generateFAQ({
        question: gap.originalQuestion,
        sourceKnowledgeGap: gap._id,
      });

      await loadFAQs();
      await loadKnowledgeGaps();
    } catch (err) {
      console.error("FAQ generation failed:", err);
      setError(err?.response?.data?.message || "Unable to generate FAQ draft.");
    } finally {
      setGeneratingGapId(null);
    }
  };

  useEffect(() => {
    loadFAQs();
    loadKnowledgeGaps();
  }, []);

  const handleFieldChange = (id, field, value) => {
    setFaqs((current) =>
      current.map((faq) =>
        faq._id === id
          ? {
              ...faq,
              [field]: value,
            }
          : faq,
      ),
    );
  };

  const handleSave = async (faq) => {
    try {
      setSavingId(faq._id);
      setError("");

      const response = await updateFAQ(faq._id, {
        question: faq.question,
        answer: faq.answer,
      });

      const updatedFAQ = response?.faq || response;

      setFaqs((current) =>
        current.map((item) => (item._id === faq._id ? updatedFAQ : item)),
      );
    } catch (err) {
      console.error("FAQ update failed:", err);

      setError(err?.response?.data?.message || "Unable to save FAQ changes.");
    } finally {
      setSavingId(null);
    }
  };

  const handleApprove = async (faq) => {
    try {
      setSavingId(faq._id);
      setError("");

      const response = await approveFAQ(faq._id);

      const approvedFAQ = response?.faq;

      const resolvedGapId =
        faq.sourceKnowledgeGap?._id || faq.sourceKnowledgeGap;

      setFaqs((current) =>
        current.map((item) =>
          item._id === faq._id
            ? approvedFAQ || {
                ...item,
                status: "approved",
                embeddingStatus: "added",
              }
            : item,
        ),
      );

      if (resolvedGapId) {
        setKnowledgeGaps((current) =>
          current.filter((gap) => gap._id !== resolvedGapId),
        );
      }
    } catch (err) {
      console.error("FAQ approval failed:", err);

      setError(err?.response?.data?.message || "Unable to approve FAQ.");
    } finally {
      setSavingId(null);
    }
  };

  const handleReject = async (faq) => {
    try {
      setSavingId(faq._id);
      setError("");

      await rejectFAQ(faq._id);

      setFaqs((current) =>
        current.map((item) =>
          item._id === faq._id
            ? {
                ...item,
                status: "rejected",
              }
            : item,
        ),
      );
    } catch (err) {
      console.error("FAQ rejection failed:", err);

      setError(err?.response?.data?.message || "Unable to reject FAQ.");
    } finally {
      setSavingId(null);
    }
  };

  const pendingFAQs = faqs.filter((faq) => faq.status === "draft");

  const approvedFAQs = faqs.filter((faq) => faq.status === "approved");

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(167,139,250,0.24),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.16),_transparent_34%),linear-gradient(135deg,_#f5f3ff_0%,_#f8fafc_48%,_#ecfeff_100%)] px-4 py-6 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl animate-pulse" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-teal-300/20 blur-3xl animate-pulse [animation-delay:1s]" />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="rounded-[28px] border border-white/70 bg-white/45 p-5 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.2)] backdrop-blur-2xl sm:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-teal-400 text-white shadow-lg shadow-violet-500/25 ring-4 ring-white/60">
              <Icon name="chat" size={22} />
            </div>
            <div>
            <p className="text-sm font-black tracking-tight text-slate-900">Support<span className="text-violet-600">AI</span></p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              FAQ Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Review, edit and approve AI-generated FAQ drafts before they enter
              the knowledge base.
            </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/80 bg-white/65 px-4 py-2.5 text-sm font-bold text-violet-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-white hover:shadow-md"
            >
              <Icon name="arrow" size={17} className="rotate-180" />
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* ========================= */}
        {/* KNOWLEDGE GAPS */}
        {/* ========================= */}

        <div className="mb-6 rounded-3xl border border-white/70 bg-white/40 p-5 shadow-sm backdrop-blur-xl sm:p-6">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <Icon name="spark" size={19} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Knowledge Gaps
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review unanswered questions and generate FAQ drafts for recurring
                  knowledge gaps.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/admin/faqs/approved")}
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-2.5 text-sm font-bold text-emerald-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-md"
            >
              <Icon name="check" size={17} />
              Approved FAQs
            </button>
          </div>

          {knowledgeGaps.length === 0 ? (
            <div className="rounded-2xl border border-white/70 bg-white/55 p-5 text-center shadow-sm">
              <p className="text-sm text-slate-500">
                No knowledge gaps have been detected yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {knowledgeGaps.map((gap) => {
                const isGenerating = generatingGapId === gap._id;

                return (
                  <div
                    key={gap._id}
                    className="rounded-2xl border border-white/75 bg-white/60 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">
                          {gap.originalQuestion}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                            Occurrences: {gap.occurrenceCount ?? 0}
                          </span>

                          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700">
                            {gap.recurrenceStatus || "emerging"}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleGenerateFAQ(gap)}
                        disabled={isGenerating}
                        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Icon name="spark" size={16} />
                        {isGenerating ? "Generating..." : "Generate FAQ Draft"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================= */}
        {/* PENDING FAQ DRAFTS */}
        {/* ========================= */}

        <div className="mb-8 mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Pending FAQ Drafts
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review and verify AI-generated FAQ drafts before adding them to
              the knowledge base.
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-white/70 bg-white/55 p-6 text-sm text-slate-600 shadow-sm">
              Loading FAQs...
            </div>
          ) : pendingFAQs.length === 0 ? (
            <div className="rounded-2xl border border-white/70 bg-white/55 p-8 text-center shadow-sm">
              <h3 className="font-semibold text-slate-800">No FAQ drafts</h3>

              <p className="mt-1 text-sm text-slate-500">
                There are currently no FAQ drafts waiting for administrator
                review.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {pendingFAQs.map((faq) => {
                const isSaving = savingId === faq._id;

                return (
                  <div
                    key={faq._id}
                    className="rounded-3xl border border-white/75 bg-white/65 p-5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-md"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        Draft
                      </span>

                      <span className="text-xs text-slate-400">
                        {faq.embeddingStatus || "not_added"}
                      </span>
                    </div>

                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Question
                    </label>

                    <textarea
                      value={faq.question || ""}
                      onChange={(event) =>
                        handleFieldChange(
                          faq._id,
                          "question",
                          event.target.value,
                        )
                      }
                      rows={2}
                      className="mb-4 w-full rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />

                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Answer
                    </label>

                    <textarea
                      value={faq.answer || ""}
                      onChange={(event) =>
                        handleFieldChange(faq._id, "answer", event.target.value)
                      }
                      rows={5}
                      className="w-full rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2.5 text-sm leading-relaxed text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleSave(faq)}
                        disabled={isSaving}
                        className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApprove(faq)}
                        disabled={isSaving}
                        className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSaving
                          ? "Processing..."
                          : "Approve & Add to Knowledge Base"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReject(faq)}
                        disabled={isSaving}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
