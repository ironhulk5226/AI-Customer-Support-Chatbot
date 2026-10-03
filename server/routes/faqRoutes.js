import express from "express";
import {
    getFAQs,
    createFAQ,
    updateFAQ,
    rejectFAQ,
    generateFAQ,
    approveFAQ,
} from "../controllers/faqController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";



const router = express.Router();

router.use(protect, requireAdmin);

router.get("/", getFAQs);
router.post("/", createFAQ);
router.post("/generate", generateFAQ);
router.put("/:id", updateFAQ);
router.patch("/:id/reject", rejectFAQ);
router.patch("/:id/approve", approveFAQ);

export default router;