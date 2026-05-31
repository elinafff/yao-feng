import express from 'express';
import { 
  createRescueRecord, getRescueRecords,
  createMedicalRecord, getMedicalRecords,
  createEndOfLifeRecord, getEndOfLifeRecords 
} from '../controllers/LifeCycleController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Rescue routes
router.post('/rescue', protect, createRescueRecord);
router.get('/rescue', getRescueRecords);

// Medical routes
router.post('/medical', protect, createMedicalRecord);
router.get('/medical', getMedicalRecords);

// End of Life routes
router.post('/eol', protect, createEndOfLifeRecord);
router.get('/eol', getEndOfLifeRecords);

export default router;
