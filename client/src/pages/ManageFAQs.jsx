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
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              FAQ Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review, edit and approve AI-generated FAQ drafts before they enter
              the knowledge base.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/faqs/approved")}
            className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Approved FAQs
          </button>
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

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Knowledge Gaps
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review unanswered questions and generate FAQ drafts for recurring
              knowledge gaps.
            </p>
          </div>

          {knowledgeGaps.length === 0 ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-5 text-center">
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
                    className="rounded-xl border border-slate-200 p-4"
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
                        className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
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

        <div className="mb-8">
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
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              Loading FAQs...
            </div>
          ) : pendingFAQs.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
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
                    className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm"
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
                      className="mb-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400"
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
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm leading-relaxed text-slate-800 outline-none focus:border-indigo-400"
                    />

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleSave(faq)}
                        disabled={isSaving}
                        className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 disabled:opacity-50"
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApprove(faq)}
                        disabled={isSaving}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {isSaving
                          ? "Processing..."
                          : "Approve & Add to Knowledge Base"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReject(faq)}
                        disabled={isSaving}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 disabled:opacity-50"
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
  );
}
