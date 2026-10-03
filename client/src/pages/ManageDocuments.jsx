import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getDocuments,
    uploadDocument,
    deleteDocument,
} from "../services/api";
import Icon from "../components/Icon";

function ManageDocuments() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [documentToDelete, setDocumentToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getDocuments();

            setDocuments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load documents:", err);
            setError("Failed to load documents.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDocuments();
    }, []);

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (!allowedTypes.includes(file.type)) {
            setError("Only PDF and DOCX files are supported.");
            event.target.value = "";
            return;
        }

        try {
            setUploading(true);
            setError("");
            setSuccess("");

            await uploadDocument(file);

            setSuccess(`${file.name} uploaded and processed successfully.`);

            event.target.value = "";

            await loadDocuments();
        } catch (err) {
            console.error("Document upload failed:", err);

            setError(
                err.response?.data?.message ||
                    "Failed to upload and process the document."
            );
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!documentToDelete) {
            return;
        }

        try {
            setDeleting(true);
            setError("");
            setSuccess("");

            await deleteDocument(documentToDelete._id);

            setDocuments((currentDocuments) =>
                currentDocuments.filter((document) => document._id !== documentToDelete._id)
            );

            setSuccess("Document deleted successfully.");
        } catch (err) {
            console.error("Document deletion failed:", err);

            setError(
                err.response?.data?.message ||
                    "Failed to delete the document."
            );
        } finally {
            setDeleting(false);
            setDocumentToDelete(null);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) {
            return "0 KB";
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.24),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.2),_transparent_35%),linear-gradient(135deg,_#eff6ff_0%,_#f8fafc_48%,_#eef2ff_100%)] px-4 py-6 sm:px-6 sm:py-10">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl animate-pulse" />
                <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl animate-pulse [animation-delay:1s]" />
            </div>

            <div className="relative z-10 mx-auto max-w-6xl">
                <div className="rounded-[28px] border border-white/70 bg-white/45 p-5 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.2)] backdrop-blur-2xl sm:p-8">

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/25 ring-4 ring-white/60">
                                <Icon name="doc" size={22} />
                            </div>
                            <div>
                                <p className="text-sm font-black tracking-tight text-slate-900">
                                    Support<span className="text-indigo-600">AI</span>
                                </p>

                                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                    Manage Documents
                                </h1>

                                <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                                    Keep the customer-support knowledge base accurate, fresh, and ready for AI-powered answers.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/admin")}
                            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/80 bg-white/65 px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white hover:shadow-md sm:px-4"
                        >
                            <span className="hidden sm:inline">Back to Dashboard</span>
                            <span className="sm:hidden">Back</span>
                        </button>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/75 bg-white/55 p-4 shadow-sm backdrop-blur-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Total documents</p>
                            <p className="mt-2 text-3xl font-black text-indigo-700">{documents.length}</p>
                        </div>
                        <div className="rounded-2xl border border-white/75 bg-white/55 p-4 shadow-sm backdrop-blur-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Processed</p>
                            <p className="mt-2 text-3xl font-black text-emerald-600">{documents.filter((document) => document.status === "processed").length}</p>
                        </div>
                        <div className="rounded-2xl border border-white/75 bg-white/55 p-4 shadow-sm backdrop-blur-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Supported formats</p>
                            <p className="mt-2 text-lg font-black text-slate-800">PDF <span className="font-normal text-slate-400">+</span> DOCX</p>
                        </div>
                    </div>

                    <div className="mt-6 rounded-3xl border border-dashed border-indigo-300/80 bg-gradient-to-br from-white/70 to-indigo-50/70 p-6 text-center shadow-inner sm:p-8">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 shadow-sm">
                            <Icon name="arrowUp" size={25} />
                        </div>
                        <h2 className="mt-4 text-lg font-bold text-slate-900">
                            Add to your knowledge base
                        </h2>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.docx"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-violet-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Icon name="plus" size={17} />
                            {uploading
                                ? "Uploading and Processing..."
                                : "Choose Document"}
                        </button>

                        {uploading && (
                            <p className="mt-3 text-sm text-slate-500">
                                Extracting, chunking, embedding, and adding to ChromaDB. Please wait.
                            </p>
                        )}
                        {!uploading && (
                            <p className="mt-3 text-xs font-medium text-slate-500">
                                PDF or DOCX files only
                            </p>
                        )}
                    </div>

                    {error && (
                        <div className="mt-5 rounded-2xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-700 shadow-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mt-5 rounded-2xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm">
                            {success}
                        </div>
                    )}

                    <div className="mt-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">
                                Knowledge Base Documents
                            </h2>

                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                                {documents.length} document
                                {documents.length === 1 ? "" : "s"}
                            </span>
                        </div>

                        <div className="mt-4">
                            {loading && (
                                <div className="rounded-2xl border border-white/70 bg-white/55 p-6 text-sm text-slate-600 shadow-sm">
                                    Loading your knowledge base...
                                </div>
                            )}

                            {!loading && documents.length === 0 && (
                                <div className="rounded-2xl border border-white/70 bg-white/55 p-10 text-center shadow-sm">
                                    <Icon name="doc" size={30} className="mx-auto text-slate-400" />
                                    <p className="mt-3 font-semibold text-slate-700">No documents yet</p>
                                    <p className="mt-1 text-sm text-slate-500">Upload your first document above to start building the knowledge base.</p>
                                </div>
                            )}

                            {!loading && documents.length > 0 && (
                                <div className="space-y-3">
                                        {documents.map((document) => (
                                            <div
                                                key={document._id}
                                                className="group flex flex-col gap-4 rounded-2xl border border-white/75 bg-white/60 p-5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white/80 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div className="flex min-w-0 items-start gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                                        <Icon name="doc" size={19} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate font-bold text-slate-900">
                                                            {document.originalFileName || document.name}
                                                        </p>

                                                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                                                        <span>{(document.fileType || "").toUpperCase()}</span>
                                                        <span className="text-slate-300">•</span>
                                                        <span>{formatFileSize(document.fileSize)}</span>
                                                        <span className="text-slate-300">•</span>
                                                        <span className={`rounded-full px-2 py-0.5 font-bold ${
                                                            document.status === "processed"
                                                                ? "bg-emerald-100 text-emerald-700"
                                                                : document.status === "failed"
                                                                  ? "bg-red-100 text-red-700"
                                                                  : "bg-amber-100 text-amber-700"
                                                        }`}>
                                                            {document.status}
                                                        </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => setDocumentToDelete(document)}
                                                    className="inline-flex self-start items-center justify-center gap-2 rounded-xl border border-red-200/80 bg-white/60 px-3 py-2 text-sm font-bold text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:shadow-sm sm:self-auto"
                                                >
                                                    <span aria-hidden="true">×</span>
                                                    Delete
                                                </button>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {documentToDelete && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm"
                        role="presentation"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget && !deleting) {
                                setDocumentToDelete(null);
                            }
                        }}
                    >
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="delete-document-title"
                            className="w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-6 shadow-2xl shadow-slate-900/20 backdrop-blur-2xl sm:p-7"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                                <span className="text-2xl font-bold">!</span>
                            </div>

                            <h2 id="delete-document-title" className="mt-5 text-xl font-bold text-slate-900">
                                Delete this document?
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-slate-500">
                                This will remove{" "}
                                <span className="font-semibold text-slate-700">
                                    {documentToDelete.originalFileName || documentToDelete.name}
                                </span>{" "}
                                from the knowledge base. This action cannot be undone.
                            </p>

                            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    disabled={deleting}
                                    onClick={() => setDocumentToDelete(null)}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={deleting}
                                    onClick={handleDelete}
                                    className="rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:-translate-y-0.5 hover:from-red-700 hover:to-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {deleting ? "Deleting..." : "Delete document"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManageDocuments;