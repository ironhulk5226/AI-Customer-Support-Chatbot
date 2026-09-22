import express from 'express';
import { getVectorStoreStatistics } from '../controllers/vectorStoreController.js';

const router = express.Router();

router.get('/stats',getVectorStoreStatistics);

export default router;