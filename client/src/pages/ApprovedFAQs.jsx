import { useEffect, useState } from "react";
import { getFAQs, updateFAQ } from "../services/api";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";

export default function ApprovedFAQs() {
  const navigate = useNavigate();

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [originalAnswer, setOriginalAnswer] = useState("");

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

  const handleEdit = (faq) => {
    setEditingId(faq._id);
    setOriginalAnswer(faq.answer || "");
    setError("");
  };

  const handleCancelEdit = (faq) => {
    handleAnswerChange(faq._id, originalAnswer);
    setEditingId(null);
    setOriginalAnswer("");
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
      setEditingId(null);
      setOriginalAnswer("");
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
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(52,211,153,0.2),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(96,165,250,0.2),_transparent_34%),linear-gradient(135deg,_#ecfdf5_0%,_#f8fafc_48%,_#eff6ff_100%)] px-4 py-6 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl animate-pulse" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl animate-pulse [animation-delay:1s]" />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="rounded-[28px] border border-white/70 bg-white/45 p-5 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.2)] backdrop-blur-2xl sm:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-blue-500 text-white shadow-lg shadow-emerald-500/25 ring-4 ring-white/60">
              <Icon name="check" size={23} />
            </div>
            <div>
            <p className="text-sm font-black tracking-tight text-slate-900">Support<span className="text-emerald-600">AI</span></p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Approved FAQs</h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              View and update FAQs that are already approved and available in
              the knowledge base.
            </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/faqs")}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/80 bg-white/65 px-3 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-md sm:px-4"
          >
            <Icon name="arrow" size={17} className="rotate-180" />
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
          <div className="rounded-2xl border border-white/70 bg-white/55 p-6 text-sm text-slate-600 shadow-sm">
            Loading approved FAQs...
          </div>
        ) : faqs.length === 0 ? (
          <div className="rounded-2xl border border-white/70 bg-white/55 p-10 text-center shadow-sm">
            <Icon name="check" size={32} className="mx-auto text-emerald-500" />
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
                  className="rounded-3xl border border-white/75 bg-white/65 p-5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                >
                  {/* Top row */}
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      <Icon name="check" size={13} />
                      Approved
                    </span>

                    <span className="rounded-full bg-slate-100/80 px-3 py-1 text-xs font-medium text-slate-500">
                      Embedding: {faq.embeddingStatus || "unknown"}
                    </span>
                  </div>

                  {/* Question */}
                  <div className="mb-4">
                    <p className="mb-1 text-sm font-semibold text-slate-700">
                      Question
                    </p>

                    <div className="rounded-xl border border-white/80 bg-slate-50/80 px-3 py-3 text-sm leading-relaxed text-slate-800">
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
                      readOnly={editingId !== faq._id}
                      rows={5}
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm leading-relaxed text-slate-800 outline-none transition ${
                        editingId === faq._id
                          ? "border-emerald-300 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          : "cursor-default border-slate-200/80 bg-slate-100/70 text-slate-600"
                      }`}
                    />
                  </div>

                  {/* Save */}
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-500">
                      {editingId === faq._id
                        ? "Save changes to update the FAQ embedding in ChromaDB."
                        : "This approved answer is read-only until you choose Edit."}
                    </p>

                    {editingId === faq._id ? (
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => handleCancelEdit(faq)}
                          disabled={isSaving}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSave(faq)}
                          disabled={isSaving}
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Icon name="check" size={16} />
                          {isSaving ? "Updating..." : "Save Changes"}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleEdit(faq)}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-sm"
                      >
                        <span aria-hidden="true">✎</span>
                        Edit Answer
                      </button>
                    )}
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
