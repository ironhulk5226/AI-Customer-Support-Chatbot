import express from "express";
import {
    registerUser,
    loginUser,
    getCurrentUser
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);

router.get("/protected", protect, (req, res) => {
    res.status(200).json({
        message: "Protected route accessed successfully",
        user: req.user
    });
});

router.get("/admin-test", protect, requireAdmin, (req, res) => {
    res.status(200).json({
        message: "Admin route accessed successfully",
        user: req.user
    });
});

export default router;