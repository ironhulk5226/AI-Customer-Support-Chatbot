import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
} from "../controllers/documentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All Knowledge Base operations are admin-only
router.use(protect, requireAdmin);

router.get("/", getDocuments);

router.get("/:id", getDocumentById);

router.delete("/:id", deleteDocument);

// POST /api/documents/upload
router.post("/upload", upload.single("document"), uploadDocument);

export default router;
