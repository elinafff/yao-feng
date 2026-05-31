import express from 'express';
import { createLog, getLogs, loginAdmin, registerAdmin } from '../controllers/AdminController';
import { createApplication, getApplications, updateApplicationStatus } from '../controllers/ApplicationController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/login', loginAdmin);
router.post('/register', registerAdmin);
router.get('/logs', getLogs);
router.post('/logs', createLog);
router.get('/applications', getApplications);
router.post('/applications', createApplication);
router.put('/applications/:id', protect, updateApplicationStatus);

export default router;
