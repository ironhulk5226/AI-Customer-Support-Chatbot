import express from "express";
import upload from "../middlewares/uploadMiddleware.js"
import { uploadDocument , getDocuments , getDocumentById , deleteDocument } from "../controllers/documentController.js";


const router = express.Router();

router.get("/",getDocuments);

router.get("/:id",getDocumentById);

router.delete("/:id",deleteDocument);

// POST /api/documents/upload
router.post("/upload",upload.single("document"),uploadDocument)

export default router;
