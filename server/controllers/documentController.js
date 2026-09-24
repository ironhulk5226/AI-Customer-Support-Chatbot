import Document from "../models/Document.js";
import fs from "fs/promises";
import { processDocument } from "../services/documentProcessingService.js";
import { generateEmbedding } from "../services/embeddingService.js";
import {
  addDocumentsToVectorStore,
  deleteDocumentsFromVectorStore,
} from "../services/vectorStoreService.js";

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No document uploaded.",
      });
    }

    const extension = req.file.originalname.split(".").pop().toLowerCase();

    const document = await Document.create({
      name: req.file.originalname,
      originalFileName: req.file.originalname,
      fileType: extension,
      fileSize: req.file.size,
      filePath: req.file.path,
      status: "processing",
      uploadedBy: req.user.userId,
    });

    try {
      // Step 1: Extract, clean and split document
      const processedData = await processDocument(req.file.path, extension);

      // Step 2: Generate embeddings for every chunk
      const embeddings = [];

      for (const chunk of processedData.chunks) {
        const embedding = await generateEmbedding(chunk);
        embeddings.push(embedding);
      }

      // Step 3: Generate unique ChromaDB IDs
      const chunkIds = processedData.chunks.map(
        (_, index) => `${document._id}-chunk-${index}`,
      );

      // Step 4: Create metadata for every chunk
      const metadatas = processedData.chunks.map((_, index) => ({
        documentId: document._id.toString(),
        documentName: document.originalFileName,
        chunkIndex: index,
        fileType: document.fileType,
      }));

      // Step 5: Store chunks in ChromaDB
      await addDocumentsToVectorStore({
        ids: chunkIds,
        documents: processedData.chunks,
        embeddings,
        metadatas,
      });

      // Step 6: Update MongoDB document status
      document.status = "processed";
      document.processedAt = new Date();
      document.processingError = null;

      await document.save();

      // Step 7: Send successful response
      res.status(201).json({
        message: "Document uploaded, processed, and indexed successfully.",

        document: {
          id: document._id,
          name: document.name,
          fileType: document.fileType,
          fileSize: document.fileSize,
          status: document.status,
          processedAt: document.processedAt,
          chunkCount: processedData.chunks.length,
        },
      });
    } catch (processingError) {
      document.status = "failed";
      document.processingError = processingError.message;

      await document.save();

      res.status(500).json({
        message: "Document uploaded but processing/indexing failed.",
        documentId: document._id,
      });
    }
  } catch (error) {
    console.error("Document upload error:", error.message);

    res.status(500).json({
      message: "Failed to upload document.",
    });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 });

    res.status(200).json({
      documents,
    });
  } catch (error) {
    console.error("Get Documents Error:", error.message);

    res.status(500).json({
      message: "Failed to fetch documents.",
    });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        message: "Document not found.",
      });
    }

    res.status(200).json({
      document,
    });
  } catch (error) {
    console.error("Get Document Error:", error.message);

    res.status(500).json({
      message: "Failed to fetch document.",
    });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        message: "Document not found.",
      });
    }

    // Step 1: Delete physical file
    try {
      await fs.unlink(document.filePath);
    } catch (fileError) {
      console.warn("File could not be deleted:", fileError.message);
    }

    // Step 2: Delete document vectors from ChromaDB
    await deleteDocumentsFromVectorStore(document._id.toString());

    // Step 3: Delete document from MongoDB
    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Document deleted successfully.",
    });
  } catch (error) {
    console.error("Delete document error:", error.message);

    res.status(500).json({
      message: "Failed to delete document.",
    });
  }
};
