import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getDocuments,
    uploadDocument,
    deleteDocument,
} from "../services/api";

function ManageDocuments() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

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

    const handleDelete = async (documentId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this document?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await deleteDocument(documentId);

            setDocuments((currentDocuments) =>
                currentDocuments.filter(
                    (document) => document._id !== documentId
                )
            );

            setSuccess("Document deleted successfully.");
        } catch (err) {
            console.error("Document deletion failed:", err);

            setError(
                err.response?.data?.message ||
                    "Failed to delete the document."
            );
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
        <div className="min-h-screen bg-[#faf8ff] px-6 py-10">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">

                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-blue-600">
                                SupportAI
                            </p>

                            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                                Manage Documents
                            </h1>

                            <p className="mt-2 text-slate-500">
                                Upload and manage documents used by the
                                customer-support knowledge base.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/admin")}
                            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Back to Dashboard
                        </button>
                    </div>

                    <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Upload Knowledge Base Document
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Supported formats: PDF and DOCX
                        </p>

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
                            className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {uploading
                                ? "Uploading and Processing..."
                                : "Choose Document"}
                        </button>

                        {uploading && (
                            <p className="mt-3 text-sm text-slate-500">
                                The document is being extracted, chunked,
                                embedded, and added to ChromaDB. Please wait.
                            </p>
                        )}
                    </div>

                    {error && (
                        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {success}
                        </div>
                    )}

                    <div className="mt-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-slate-900">
                                Knowledge Base Documents
                            </h2>

                            <span className="text-sm text-slate-500">
                                {documents.length} document
                                {documents.length === 1 ? "" : "s"}
                            </span>
                        </div>

                        <div className="mt-4">
                            {loading && (
                                <div className="rounded-xl border border-slate-200 p-5 text-sm text-slate-500">
                                    Loading documents...
                                </div>
                            )}

                            {!loading && documents.length === 0 && (
                                <div className="rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-500">
                                    No documents have been uploaded yet.
                                </div>
                            )}

                            {!loading && documents.length > 0 && (
                                <div className="overflow-hidden rounded-xl border border-slate-200">
                                    <div className="divide-y divide-slate-200">
                                        {documents.map((document) => (
                                            <div
                                                key={document._id}
                                                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div className="min-w-0">
                                                    <p className="font-medium text-slate-900">
                                                        {document.originalFileName ||
                                                            document.name}
                                                    </p>

                                                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                                                        <span>
                                                            {(
                                                                document.fileType ||
                                                                ""
                                                            ).toUpperCase()}
                                                        </span>

                                                        <span>
                                                            {formatFileSize(
                                                                document.fileSize
                                                            )}
                                                        </span>

                                                        <span
                                                            className={
                                                                document.status ===
                                                                "processed"
                                                                    ? "font-medium text-green-600"
                                                                    : document.status ===
                                                                        "failed"
                                                                      ? "font-medium text-red-600"
                                                                      : "font-medium text-amber-600"
                                                            }
                                                        >
                                                            {document.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            document._id
                                                        )
                                                    }
                                                    className="self-start rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 sm:self-auto"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ManageDocuments;