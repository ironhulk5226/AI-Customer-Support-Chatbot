import { useEffect, useState } from "react";
import { getFAQs, updateFAQ } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function ApprovedFAQs() {
  const navigate = useNavigate();

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  const loadFAQs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getFAQs();

      const allFAQs = Array.isArray(response) ? response : response?.faqs || [];

      setFaqs(allFAQs.filter((faq) => faq.status === "approved"));
    } catch (err) {
      console.error("Approved FAQ loading failed:", err);

      setError(err?.response?.data?.message || "Unable to load approved FAQs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFAQs();
  }, []);

  const handleAnswerChange = (id, value) => {
    setFaqs((current) =>
      current.map((faq) =>
        faq._id === id
          ? {
              ...faq,
              answer: value,
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
      console.error("Approved FAQ update failed:", err);

      setError(
        err?.response?.data?.message || "Unable to update approved FAQ.",
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Approved FAQs</h1>

            <p className="mt-1 text-sm text-slate-500">
              View and update FAQs that are already approved and available in
              the knowledge base.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/faqs")}
            className="shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back to FAQ Management
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Loading approved FAQs...
          </div>
        ) : faqs.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="font-semibold text-slate-800">No approved FAQs</h2>

            <p className="mt-1 text-sm text-slate-500">
              Approved FAQs will appear here after an administrator approves a
              FAQ draft.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {faqs.map((faq) => {
              const isSaving = savingId === faq._id;

              return (
                <div
                  key={faq._id}
                  className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
                >
                  {/* Top row */}
                  <div className="mb-5 flex items-center justify-between">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Approved
                    </span>

                    <span className="text-xs text-slate-500">
                      Embedding: {faq.embeddingStatus || "unknown"}
                    </span>
                  </div>

                  {/* Question */}
                  <div className="mb-4">
                    <p className="mb-1 text-sm font-semibold text-slate-700">
                      Question
                    </p>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800">
                      {faq.question}
                    </div>
                  </div>

                  {/* Answer */}
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Answer
                    </label>

                    <textarea
                      value={faq.answer || ""}
                      onChange={(event) =>
                        handleAnswerChange(faq._id, event.target.value)
                      }
                      rows={5}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm leading-relaxed text-slate-800 outline-none focus:border-emerald-400"
                    />
                  </div>

                  {/* Save */}
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <p className="text-xs text-slate-500">
                      Saving changes also updates the FAQ embedding in ChromaDB.
                    </p>

                    <button
                      type="button"
                      onClick={() => handleSave(faq)}
                      disabled={isSaving}
                      className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {isSaving ? "Updating..." : "Save Answer Changes"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
